const { model } = require('../config/gemini');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Language configurations
const languageConfigs = {
  javascript: {
    extension: 'js',
    command: 'node',
    tempDir: 'js_temp'
  },
  python: {
    extension: 'py',
    command: 'python',
    tempDir: 'py_temp'
  },
  cpp: {
    extension: 'cpp',
    command: os.platform() === 'win32' ? '.\\{executable}' : './{executable}',
    compile: os.platform() === 'win32' 
      ? 'g++ "{file}" -o "{executable}"'
      : 'g++ "{file}" -o "{executable}"',
    tempDir: 'cpp_temp'
  },
  java: {
    extension: 'java',
    command: 'java',
    compile: 'javac "{file}"',
    tempDir: 'java_temp',
    className: 'Main'  // For Java files
  }
};

const generateResponse = async (req, res) => {
  try {
    const { prompt, action } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Different prompts based on action type
    let enhancedPrompt;
    if (action === 'execute') {
      enhancedPrompt = `
Please provide a structured response in the following format:

1. Code Execution Results:
   - Output: [execution output]
   - Status: [success/failure]
   - Time taken: [execution time]

2. Console Output:
   - [List all console.log outputs]

3. Analysis:
   - Performance: [performance analysis]
   - Memory usage: [memory usage details]
   - Time complexity: [O notation]

4. Issues (if any):
   - Errors: [list any errors]
   - Warnings: [list any warnings]
   - Suggestions: [improvement suggestions]

Code to execute: ${prompt}
      `.trim();
    } else {
      enhancedPrompt = `
Please provide a structured response in the following format:

1. Solution Overview:
   - Purpose: [brief explanation]
   - Key concepts: [list main concepts]
   - Approach: [solution approach]

2. Code Implementation:
   \`\`\`[language]
   [code with comments]
   \`\`\`

3. Step-by-Step Explanation:
   a. [First step]
   b. [Second step]
   c. [Additional steps...]

4. Usage Examples:
   - Basic usage: [example]
   - Advanced usage: [example]
   - Edge cases: [example]

5. Best Practices:
   - Do's: [list recommendations]
   - Don'ts: [list what to avoid]
   - Performance tips: [optimization tips]

6. Code Execution:
   - How to run: [instructions]
   - Expected output: [what to expect]
   - Troubleshooting: [common issues]

Original prompt: ${prompt}
      `.trim();
    }

    const result = await model.generateContent(enhancedPrompt);
    const text = result.response.text();

    // Format the response with proper line breaks and indentation
    const formattedText = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .join('\n');

    res.json({ 
      response: formattedText,
      model: "gemini-1.5-pro"
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: "Error generating response",
      details: error.message,
      model: "gemini-1.5-pro"
    });
  }
};

const executeCode = async (req, res) => {
  try {
    const { code, language = 'javascript', input = '' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const config = languageConfigs[language];
    if (!config) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    // Create unique names
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const tempDir = path.join(os.tmpdir(), `code_${timestamp}_${random}`);
    await fs.mkdir(tempDir, { recursive: true });

    try {
      const fileName = `temp_${timestamp}_${random}.${config.extension}`;
      const filePath = path.join(tempDir, fileName);
      const executableName = `output_${timestamp}_${random}${os.platform() === 'win32' ? '.exe' : ''}`;
      
      await fs.writeFile(filePath, code);

      let output = '';
      let error = null;

      if (language === 'cpp') {
        // Modify the code to use hardcoded test values instead of cin
        const modifiedCode = code.replace(/cin\s*>>\s*([a-zA-Z0-9_]+)/g, (match, variable) => {
          return `${variable} = 5; // Test value replacing cin`;
        });

        await fs.writeFile(filePath, modifiedCode);

        const compileCommand = config.compile
          .replace('{file}', filePath)
          .replace('{executable}', executableName);

        try {
          // Compile
          await new Promise((resolve, reject) => {
            exec(compileCommand, { cwd: tempDir }, (err, stdout, stderr) => {
              if (err) {
                reject(new Error(stderr || err.message));
                return;
              }
              resolve(stdout);
            });
          });

          // Execute
          const execCommand = config.command.replace('{executable}', executableName);
          output = await new Promise((resolve, reject) => {
            exec(execCommand, { 
              cwd: tempDir,
            }, (err, stdout, stderr) => {
              if (err) {
                reject(new Error(stderr || err.message));
                return;
              }
              resolve(stdout);
            });
          });

          // Add explanation about test values
          // output = "Note: Program executed with test values (5) replacing cin inputs.\n\n" + output;

        } catch (err) {
          error = err.message;
        }

        // Cleanup
        try {
          await fs.unlink(path.join(tempDir, executableName));
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      } else {
        // For other languages, use existing logic
        const executeCommand = `${config.command} "${fileName}"`;
        try {
          output = await new Promise((resolve, reject) => {
            exec(executeCommand, { cwd: tempDir }, (err, stdout, stderr) => {
              if (err) {
                reject(new Error(stderr || err.message));
                return;
              }
              resolve(stdout);
            });
          });
        } catch (err) {
          error = err.message;
        }
      }

      // Cleanup
      try {
        await fs.unlink(filePath);
        await fs.rmdir(tempDir);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }

      res.json({
        success: !error,
        output: output || '',
        error: error,
        language
      });

    } catch (error) {
      console.error('Execution error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        language
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

module.exports = {
  generateResponse,
  executeCode
}; 