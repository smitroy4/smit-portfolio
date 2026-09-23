# Vector Databases for Java Developers: Pinecone, Weaviate, Qdrant

> *In the Proficient guide, you built services that talked to each other across the network, with circuit breakers and tracing. This guide is about a different kind of conversation — one where "find me something similar" doesn't mean SQL's LIKE operator, but rather embedding the question and the data into high-dimensional space and asking "which points are closest?" Vector databases are the infrastructure for that second kind of search, and they're becoming as fundamental to modern systems as relational databases already are.*

Every database you've built with Spring Data JPA has answered one class of question well: "find rows that match these exact criteria." `SELECT * FROM products WHERE price > 100 AND category = 'electronics'` is fast because indexes were built with exact matching in mind. But a growing class of real problems don't fit that shape — "find me documents similar to this one," "recommend products a user like this would probably want," "search for the semantic meaning of this text, not just the keywords" — none of these have a clean SQL WHERE clause. **Vector databases** solve this by storing data not as rows in a table, but as **vectors** (arrays of decimal numbers) in high-dimensional space, where "similarity" becomes distance, and the database's job is to find the nearest neighbors fast.

---

## Chapter 1 — What Is a Vector and Why Should You Care

A **vector** is just an array of numbers — [0.2, -0.5, 0.8, 0.1, -0.3, ...] — but the insight that makes it powerful is that you can **embed** arbitrary data (text, images, audio) into this space using a pre-trained **embedding model**. The embedding model is a neural network that's been trained to put semantically similar things close together in that space and dissimilar things far apart. Feed the text "car" and the text "automobile" to an embedding model, and you'll get two vectors that are very close to each other (small distance). Feed "car" and "bicycle" and the vectors will be farther apart (larger distance). The distance isn't arbitrary — it's a measure of how semantically related the two pieces of data are, without you ever writing a single line of custom logic.

```
Embedding a piece of text:
  Input text: "The quick brown fox jumps over the lazy dog"
                                    │
                                    ▼
                          [Embedding Model]
                          (e.g., OpenAI's text-embedding-3-small)
                                    │
                                    ▼
  Output vector: [0.2145, -0.5321, 0.8902, -0.1234, 0.4567, ... 1536 dimensions total]

Another piece of text with similar meaning:
  Input: "A fast brown fox leaps over a sleeping dog"
                                    │
                                    ▼
                          [Same Embedding Model]
                                    │
                                    ▼
  Output: [0.2089, -0.5298, 0.8876, -0.1267, 0.4601, ... ] ← very close to the first vector
```

This is the insight that makes semantic search work: you don't build custom logic to detect synonyms or rephrasings, you just embed everything into a space where synonyms automatically end up close to each other.

```java
// Java example: embedding text with Spring AI (abstraction over multiple providers)
@Service
@RequiredArgsConstructor
public class EmbeddingService {

    private final EmbeddingClient embeddingClient;

    public float[] embedText(String text) {
        // Spring AI abstracts OpenAI, Ollama, Hugging Face, and others
        EmbeddingResponse response = embeddingClient.call(
            new EmbeddingRequest(List.of(text), EmbeddingOptions.builder()
                .model("text-embedding-3-small")
                .build())
        );
        return response.getResult().getOutput().stream()
            .flatMapToDouble(value -> Arrays.stream((double[]) value))
            .mapToFloat(d -> (float) d)
            .toArray();
    }
}
```

The practical implication: **Retrieval Augmented Generation (RAG)** — the pattern where you embed a user's question, search a vector database for similar documents, and feed those documents as context to a large language model — has become the standard pattern for "make an LLM answer questions about my proprietary data" systems, which is why vector databases matter even if you're not building explicit similarity-search features.

---

## Chapter 2 — Vector Database Landscape: Pinecone vs Weaviate vs Qdrant

There are roughly three categories of vector database choice:

**Pinecone** is a managed, SaaS-only vector database — you don't run it yourself, you send data to Pinecone's cloud, and they handle scaling, replication, and all infrastructure concerns. It's the easiest to get started with (no servers to run) and the most opinionated (you use Pinecone's client libraries and query API, not SQL or anything else).

**Weaviate** and **Qdrant** are open-source, self-hosted options — you run them on your own infrastructure (or use their managed cloud offerings), giving you full control over configuration and deployment. Qdrant is lighter-weight and purpose-built for vectors; Weaviate is broader, with more built-in features (generative modules, text-to-vector pipelines) but higher operational overhead.

```
                  Pinecone              Weaviate              Qdrant
────────────────────────────────────────────────────────────────────
Deployment        SaaS only             Self-hosted or        Self-hosted or
                                        managed cloud          managed cloud

Language          HTTP API              REST + GraphQL        REST + gRPC

Overhead          Minimal               Medium-high           Low

Best for          RAG + semantic        Multi-modal,          High-performance
                  search                enterprises            vector similarity

Scaling           Automatic             Manual or k8s          Manual or k8s
```

![Vector database comparison — three approaches to storing and searching vectors](/images/blogs/internals/vector-db-comparison.png)

The practical rule: **start with Pinecone for a proof of concept** (no infrastructure, fastest to ship), then **migrate to Qdrant if you hit pricing concerns or want full control**, or **Weaviate if you need advanced features like multimodal search or semantic classifiers built-in**. For learning, local **Weaviate** or **Qdrant** instances via Docker are free and let you own the whole stack.

> ⚠️ **Golden Rule:** embedding models are not free — OpenAI's text-embedding-3-small costs ~$0.02 per 1M tokens, and that cost scales with your data volume. Budget for embeddings from day one, and consider open-source alternatives like HuggingFace's `sentence-transformers` (runs locally, no API cost) for non-production or cost-sensitive workloads.

---

## Chapter 3 — Semantic Search: The Core Pattern

The most common use case for a vector database is **semantic search** — "find documents similar to this query" without needing keyword matching. The pattern is always:

1. **Embed the query** (user's input text) using the same embedding model used to embed the data
2. **Search the vector database** for the k nearest neighbors to that query vector
3. **Return the results** (the original documents, ranked by similarity)

```java
@Service
@RequiredArgsConstructor
public class DocumentSearchService {

    private final EmbeddingClient embeddingClient;
    private final VectorStore vectorStore;  // Spring AI abstraction over Pinecone/Weaviate/Qdrant

    public List<Document> semanticSearch(String query, int topK) {
        // Step 1: embed the query
        float[] queryEmbedding = embeddingClient.embed(query);

        // Step 2: search the vector database for k nearest neighbors
        SearchRequest searchRequest = SearchRequest.builder()
            .query(query)
            .topK(topK)
            .build();

        // Step 3: return results (Spring AI handles the vector DB interaction)
        return vectorStore.similaritySearch(searchRequest);
    }
}
```

The critical insight: the embedding model is where your semantic understanding actually lives. A model trained on English will embed English text correctly but might produce meaningless vectors for Chinese. A model trained on generic text will embed technical documentation poorly compared to a specialized model. Choosing (or fine-tuning) the right embedding model is as important as choosing the vector database itself.

```yaml
# application.yml — Spring AI configuration for multiple vector stores
spring:
  ai:
    # Using OpenAI's embeddings model
    openai:
      api-key: ${OPENAI_API_KEY}
      embedding:
        model: text-embedding-3-small
        
    # Connecting to a self-hosted Qdrant instance
    vectorstore:
      qdrant:
        host: localhost
        port: 6333
        collection-name: documents
```

> 💡 **Pro tip:** for RAG systems, embed chunks, not whole documents — a 10KB document produces one vector, but if the answer to a user's question is in one specific paragraph, that paragraph's vector will be closer to the query than the full document's vector. Chunk strategically (semantically related chunks, not just "every 512 tokens"), embed each chunk separately, and store the chunk-to-document mapping so you can retrieve the right context to send to the LLM.

---

## Chapter 4 — Pinecone: Managed Simplicity

Pinecone is the "batteries included" choice — you create an index (vector collection), send it vectors with metadata, and query by similarity. No infrastructure to manage, no tuning knobs, automatic scaling and replication.

```java
@Service
@RequiredArgsConstructor
public class PineconeVectorService {

    private final PineconeClient pineconeClient;
    private final EmbeddingClient embeddingClient;

    public void indexDocument(String documentId, String text, Map<String, String> metadata) {
        // Embed the text
        float[] embedding = embeddingClient.embed(text);

        // Send to Pinecone
        pineconeClient.upsertVectors("documents-index", List.of(
            new Vector()
                .setId(documentId)
                .setValues(embedding)
                .setMetadata(metadata)  // store original text, source URL, etc.
        ));
    }

    public List<QueryResult> search(String query, int topK) {
        float[] queryEmbedding = embeddingClient.embed(query);
        
        return pineconeClient.query("documents-index", List.of(
            new QueryVector()
                .setValues(queryEmbedding)
                .setTopK(topK)
                .setIncludeMetadata(true)
        )).getResults();
    }
}
```

Trade-off: you pay Pinecone for every vector stored and every query run, which is fine for small to medium systems but adds up at scale. There's also vendor lock-in — migrating away requires re-embedding all your data with a different provider.

---

## Chapter 5 — Qdrant: Self-Hosted Performance

Qdrant is purpose-built for vector similarity search — lightweight, fast, and designed to scale horizontally on your own infrastructure. The architecture is simpler than Weaviate's, which means fewer built-in features but also fewer moving parts to understand and tune.

```java
@Configuration
public class QdrantConfig {

    @Bean
    public QdrantClient qdrantClient() {
        // Connect to self-hosted Qdrant instance
        return new QdrantClient("localhost", 6333);
    }
}

@Service
@RequiredArgsConstructor
public class QdrantVectorService {

    private final QdrantClient qdrantClient;
    private final EmbeddingClient embeddingClient;

    public void createCollection(String collectionName, int vectorSize) {
        qdrantClient.recreateCollection(collectionName,
            new VectorParams(vectorSize, Distance.COSINE));  // Cosine distance = angle between vectors
    }

    public void indexDocument(String collectionName, String documentId, String text) {
        float[] embedding = embeddingClient.embed(text);

        qdrantClient.upsert(collectionName, List.of(
            new PointStruct(
                UUID.fromString(documentId),
                embedding,
                Map.of("text", text)  // payload — metadata stored with the vector
            )
        ));
    }

    public List<ScoredPoint> search(String collectionName, String query, int limit) {
        float[] queryEmbedding = embeddingClient.embed(query);

        return qdrantClient.search(collectionName, queryEmbedding, limit, 0.5f);
    }
}
```

The key advantage: you own the data and the infrastructure, pay no per-query fees, and can run it in your Kubernetes cluster from Chapter 11 of the Proficient guide. The trade-off: you're responsible for scaling, replication, backups, and tuning.

> 💡 **Interview framing:** when asked to design a system with semantic search, naming Qdrant for self-hosted or Pinecone for managed, and understanding the trade-off between operational burden and cost, shows you've thought through the full stack, not just "vector databases exist."

---

## Chapter 6 — Weaviate: Feature-Rich Enterprise

Weaviate is the "kitchen sink" option — it includes not just vector search, but also generative modules (call an LLM directly from a query), multi-modal search (embed images and text in the same space), and semantic classifiers. This makes it powerful for complex RAG workflows but also means more operational complexity.

```java
@Service
@RequiredArgsConstructor
public class WeaviateVectorService {

    private final WeaviateClient weaviateClient;
    private final EmbeddingClient embeddingClient;

    public void indexDocument(String className, String documentId, String text) {
        float[] embedding = embeddingClient.embed(text);

        weaviateClient.data().creator()
            .withClassName(className)
            .withID(documentId)
            .withProperties(Map.of("text", text, "embedding", embedding))
            .run();
    }

    public List<WeaviateObject> semanticSearch(String className, String query) {
        float[] queryEmbedding = embeddingClient.embed(query);

        // Weaviate's GraphQL-based search — more expressive than REST
        return weaviateClient.graphQL().get()
            .withClassName(className)
            .withNearVector(new NearVectorArgument().withVector(queryEmbedding))
            .withLimit(10)
            .run()
            .getResult()
            .getData()
            .getT()
            .getResults();
    }

    // Generate an answer using an LLM, grounded in search results
    public String generateAnswer(String className, String query) {
        float[] queryEmbedding = embeddingClient.embed(query);

        // Weaviate's generative module — search + LLM in one query
        return weaviateClient.graphQL().get()
            .withClassName(className)
            .withNearVector(new NearVectorArgument().withVector(queryEmbedding))
            .withGenerate(new GenerateArgument()
                .withSinglePrompt("Summarize the following in one sentence: {text}"))
            .run()
            .getResult()
            .getData()
            .getT()
            .getGenerate()
            .getSingleResult();
    }
}
```

Weaviate's multi-modal search is particularly useful for systems that mix text and images — you embed both into the same space, and a user's text query can find similar images, and vice versa. This is beyond what Pinecone or Qdrant offer natively.

---

## Chapter 7 — RAG: Retrieval Augmented Generation

**Retrieval Augmented Generation** is the canonical pattern for "make an LLM answer questions about my proprietary data without fine-tuning" — and it's built entirely on top of vector databases.

```
User Question
    │
    ▼
[Embed Question]
    │
    ▼
[Search Vector DB for k similar documents]
    │
    ▼
[Construct Prompt: "Answer this question using only: <retrieved docs>"]
    │
    ▼
[Send to LLM (GPT, Claude, etc.)]
    │
    ▼
Generated Answer (grounded in your proprietary data)
```

```java
@Service
@RequiredArgsConstructor
public class RAGService {

    private final VectorStore vectorStore;
    private final ChatClient chatClient;  // Spring AI abstraction over OpenAI, Claude, etc.

    public String answerQuestion(String question) {
        // Step 1: retrieve similar documents from vector DB
        SearchRequest searchRequest = SearchRequest.builder()
            .query(question)
            .topK(5)
            .build();

        List<Document> relevantDocs = vectorStore.similaritySearch(searchRequest);

        // Step 2: construct a prompt grounded in retrieved documents
        String context = relevantDocs.stream()
            .map(Document::getContent)
            .collect(Collectors.joining("\n\n"));

        String prompt = String.format(
            "Answer the following question using ONLY the provided context. " +
            "If the answer is not in the context, say so.\n\n" +
            "Context:\n%s\n\n" +
            "Question: %s",
            context, question
        );

        // Step 3: send to LLM
        return chatClient.call(prompt);
    }
}
```

The critical discipline in RAG: **grounding** — the LLM should only answer based on the retrieved documents, not on its training data. A well-written system prompt and honest context construction is what prevents hallucination. The vector database's job is to make sure the *right* documents get retrieved, so the LLM has good ground truth to work with.

> ⚠️ **Golden Rule:** RAG quality depends entirely on chunk quality and embedding model fitness — a vector database that returns irrelevant documents because your chunks are too large or your embedding model is poorly chosen will produce garbage answers no matter how sophisticated your LLM is. Invest time in chunking strategy and embedding model selection before blaming the vector database.

---

## Chapter 8 — Key Takeaways

**What Is It**
- Vector databases store data as vectors (embeddings) in high-dimensional space, where distance = semantic similarity
- Embedding models (OpenAI, Ollama, HuggingFace) convert text, images, or audio into these vectors — the model is where your semantic understanding actually lives

**Which One**
- **Pinecone** for fastest proof-of-concept and managed simplicity (SaaS, pay-per-query)
- **Qdrant** for self-hosted performance and full control (open-source, cost-effective at scale)
- **Weaviate** for feature-rich enterprise systems with multi-modal search and built-in generative modules

**The Core Pattern**
- Embed data once at indexing time, embed queries at search time
- Find k nearest neighbors, return ranked by distance
- Use the same embedding model for both data and queries, or semantic relevance breaks

**RAG: The Canonical Use Case**
- Retrieve relevant documents via vector search
- Pass them as grounded context to an LLM
- LLM answers using only what it was given, not hallucinations from training data
- Quality depends on chunking strategy + embedding model fitness + prompt discipline, not just the vector database

**Production Considerations**
- Embedding models have real costs — budget for millions of tokens
- Vector databases are a separate piece of infrastructure from your relational database — they solve a different class of problem
- Semantic search is not a replacement for full-text search; use both where they fit different queries

---

*Vector databases are not a mandatory upgrade to every system — they're a tool for a specific class of problem: "find me what's similar" instead of "find me what matches these exact criteria." But that class of problem is growing fast, and the cost of vector databases and embeddings models is dropping fast, which means RAG and semantic search are becoming as standard as full-text search already was. This is why understanding them matters before you need to build one.*