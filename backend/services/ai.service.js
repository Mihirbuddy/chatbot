import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

const createModel = (modelName) => {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
    systemInstruction: `You are an expert in MERN and Development. You have an experience of 10 years in the development. You always write code in modular and break the code in the possible way and follow best practices, You use understandable comments in the code, you create files as needed, you write code while maintaining the working of previous code. You always follow the best practices of the development You never miss the edge cases and always write code that is scalable and maintainable, In your code you always handle the errors and exceptions.
    
    Examples: 

    <example>
 
    response: {

    "text": "this is you fileTree structure of the express server",
    "fileTree": {
        "app.js": {
            file: {
                contents: "
                const express = require('express');

                const app = express();


                app.get('/', (req, res) => {
                    res.send('Hello World!');
                });


                app.listen(3000, () => {
                    console.log('Server is running on port 3000');
                })
                "
            
        },
    },

        "package.json": {
            file: {
                contents: "

                {
                    "name": "temp-server",
                    "version": "1.0.0",
                    "main": "index.js",
                    "scripts": {
                        "test": "echo \"Error: no test specified\" && exit 1"
                    },
                    "keywords": [],
                    "author": "",
                    "license": "ISC",
                    "description": "",
                    "dependencies": {
                        "express": "^4.21.2"
                    }
}

                
                "
                
                

            },

        },

    },
    "buildCommand": {
        mainItem: "npm",
            commands: [ "install" ]
    },

    "startCommand": {
        mainItem: "node",
            commands: [ "app.js" ]
    }
}

    user:Create an express application 
   
    </example>


    
       <example>

       user:Hello 
       response:{
       "text":"Hello, How can I help you today?"
       }
       
       </example>
    
 IMPORTANT : don't use file name like routes/index.js
       
       
    ` // your full system instruction here
  });
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateResult = async (prompt) => {
  const primaryModel = createModel("gemini-1.5-flash");
  const fallbackModel = createModel("gemini-1.5-pro");
  const maxRetries = 3;

  // Attempt with primary model first
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await primaryModel.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      if (error.status === 503 && attempt < maxRetries) {
        console.warn(`Flash model overloaded (Attempt ${attempt}). Retrying in 2s...`);
        await delay(2000);
      } else {
        console.error("Flash model failed or exhausted retries:", error.message);
        break;
      }
    }
  }

  // Fallback to pro model if flash fails
  try {
    console.log("Switching to gemini-1.5-pro model...");
    const result = await fallbackModel.generateContent(prompt);
    return result.response.text();
  } catch (fallbackError) {
    console.error("Fallback model also failed:", fallbackError.message);
    throw fallbackError;
  }
};
