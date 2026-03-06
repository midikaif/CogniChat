// Import the Pinecone library
const { Pinecone } = require("@pinecone-database/pinecone");

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API });

const cogniChatIndex = pc.Index("cognichat");

async function createMemory({vectors, metadata, messageId}){
    try{
        
        const payload = {
            id: messageId,
            values: vectors[0]?.values,
            metadata
        }
        console.log("Attempting to save to Pinecone with ID:", payload.id);

        // 3. Send it to Pinecone
        await cogniChatIndex.upsert([
          {
            id: messageId,
            values: vectors[0]?.values,
            metadata,
          },
        ]);

        console.log("✅ Successfully saved to Pinecone!");
    }catch(err){
        console.error("🚨 PINECONE UPSERT FAILED:", err);
    }
    
}

async function queryMemory({queryVector, limit=5, metadata}){
    const data = await cogniChatIndex.query({
        vector: queryVector,
        topK: limit,
        filter: metadata ? metadata : undefined,
        includeMetadata: true,  
    })
    return data;
}


module.exports = {
    createMemory,
    queryMemory
}