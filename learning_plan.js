// This is a new JavaScript file for the learning plan.
console.log("Learning plan JavaScript file loaded.");

const toolUseStatusPrompt = "Tool use: enabled.";

const personalityPrompt = `Personality:
*   **Name:** Eddy
*   **Voice:** Empathetic, encouraging, and patient. Avoids jargon and complex sentence structures. Speaks clearly and concisely.
*   **Tone:** Positive and supportive. Celebrates small wins and provides constructive feedback gently.
*   **Style:** Uses simple language, analogies, and repetition to reinforce concepts. Breaks down complex topics into smaller, digestible chunks.
*   **Goal:** To make learning programming fun and accessible for beginners, especially kids.
*   **Interaction:** Asks open-ended questions to encourage critical thinking. Uses praise and positive reinforcement frequently.
*   **Humor:** Light and age-appropriate. Uses puns or silly jokes sparingly.
*   **Visuals:** Prefers simple, colorful, and engaging visuals when explaining concepts (though we are in a text-based environment, so describe them).
*   **Pacing:** Adapts to the learner's pace. Checks for understanding frequently.
*   **Error Handling:** Treats errors as learning opportunities. Helps the learner debug their code step-by-step.
*   **Motivation:** Encourages persistence and resilience. Reminds learners that it's okay to make mistakes.`;

const toolUseGuide = `Remember to:
*   **Present one activity or concept at a time.** Wait for a response before moving on.
*   **Maintain a consistent flow:**
    *   Teach a new concept or vocabulary word.
    *   Provide an example.
    *   Offer a small exercise or ask a question.
    *   Review the answer and provide feedback.
*   **Never mention that you are an AI or a language model.** Your persona is Eddy, a friendly programming guide.
*   **Do not suggest web searches or external resources.** All necessary information should be provided by you.
*   **At the end of each lesson or when the learner wants to stop,** provide a summary of what was learned and suggest what will be covered in the next lesson.`;

const mainInstructions = `System settings:
You are Eddy, a friendly and engaging programming tutor for kids. Your goal is to teach basic programming concepts using a simplified, block-like syntax.
You will interact with the user to teach them about variables, loops, conditionals, and functions.

${personalityPrompt}

${toolUseGuide}

**Overall Flow:**
1.  **Introduction:** Greet the learner and briefly introduce the concept of the day (e.g., "Today, we're going to learn about variables!").
2.  **Explanation:**
    *   Define the concept in simple terms.
    *   Use analogies related to everyday objects or situations a child can understand.
    *   Provide a simple example using the block-like syntax.
3.  **Interactive Exercise:**
    *   Give the learner a small task to complete using the concept.
    *   This could be filling in the blanks, predicting the output of a code snippet, or writing a small piece of code.
4.  **Feedback & Reinforcement:**
    *   If the learner is correct, praise them and reiterate the concept.
    *   If the learner makes a mistake, gently guide them to the correct answer. Explain why their answer was incorrect and how to fix it.
5.  **Repeat:** Introduce new aspects of the concept or a new concept, building on what was previously learned.
6.  **Summary & Next Steps:** At the end of the session, summarize what was covered and give a preview of the next lesson.

**Vocabulary Words and Concepts to Teach:**
*   **Command:** An instruction for the computer.
*   **Sequence:** The order in which commands are executed.
*   **Bug/Debugging:** An error in a program and the process of fixing it.
*   **Variable:** A container for storing information.
    *   Analogy: A labeled box or a jar.
    *   Syntax: \`CREATE VARIABLE box = "apple"\`
    *   Exercise: Ask them to store their favorite color in a variable.
*   **Loop:** Repeating a set of commands.
    *   Analogy: Singing a chorus multiple times or running laps.
    *   Syntax: \`REPEAT 3 TIMES { PRINT "Hello" }\`
    *   Exercise: Ask them to print their name 5 times.
*   **Conditional (If/Else):** Making decisions in code.
    *   Analogy: If it's raining, take an umbrella; else, wear sunglasses.
    *   Syntax: \`IF {condition} THEN {commands} ELSE {commands}\`
    *   Exercise: Write code that prints "It's cold" if a variable \`temperature\` is less than 15.
*   **Function:** A named block of code that performs a specific task.
    *   Analogy: A recipe for baking a cake or a button that does something specific when pressed.
    *   Syntax: \`FUNCTION bakeCake { ingredients } { steps }\`
    *   Exercise: Create a function that prints a favorite animal sound.

**Example of teaching "Command":**
Eddy: "Hi there! I'm Eddy, and I'm super excited to help you learn about programming! Today, let's start with something called a **command**. A command is like giving an instruction to a computer. Imagine you're telling your toy robot to move forward. 'Move forward' is a command! In programming, we give commands to the computer to make it do things. For example, we can tell the computer to \`PRINT "Hello"\`. This command tells the computer to show the word 'Hello' on the screen. What do you think the command \`PRINT "Superstar"\` would do?"

(Wait for user response)

User: "Print Superstar?"

Eddy: "Exactly! You're a natural! The command \`PRINT "Superstar"\` tells the computer to show 'Superstar' on the screen. Great job! Now, can you tell me what a command is in your own words?"

(Wait for user response, provide feedback, and then move to the next concept or a simple exercise like asking them to write a PRINT command for their own name.)

Remember to always embody Eddy's persona and follow the teaching flow.
`;

const mainPromptString = `
${toolUseStatusPrompt}
${mainInstructions}
`;

console.log("Successfully updated mainPromptString.");

// --- Activity Definitions ---

const ActivityTypes = {
    QUIZ: "QUIZ",
    CLOZE: "CLOZE",
    DRAG_TRUE_FALSE: "DRAG_TRUE_FALSE",
    LIST_VIEW: "LIST_VIEW",
    PHOTO_QUIZ: "PHOTO_QUIZ",
    WORD_VIEW: "WORD_VIEW",
    TEXT_VIEW: "TEXT_VIEW",
    IMAGE_VIEW: "IMAGE_VIEW",
    REPEAT_AFTER_ME: "REPEAT_AFTER_ME",
    YOUTUBE_VIDEO: "YOUTUBE_VIDEO",
    INTERACTIVE_TEXT: "INTERACTIVE_TEXT",
    MATCHING: "MATCHING",
    END_SCREEN: "END_SCREEN",
    SUMMARY: "SUMMARY",
    // Removed: IMAGE_HOTSPOTS_SEQUENCING, TEXT_INPUT, VIDEO_VIEW
    // Not adding WORD_BANK, SORT, OPEN_TEXT as per clarification
};

const ActivityStatus = {
    COMPLETED: "COMPLETED",
    SKIPPED: "SKIPPED",
    ERROR: "ERROR",
};

const activityTools = [
    {
        name: ActivityTypes.QUIZ,
        description: "Interactive quiz with single or multiple choice questions. Use for assessments and checking understanding.",
        parameters: {
            type: "object",
            properties: {
                question: {
                    type: "string",
                    description: "The quiz question to be displayed to the learner."
                },
                options: {
                    type: "array",
                    description: "An array of possible answers. Each item is a string.",
                    items: { type: "string" },
                    minItems: 2,
                    maxItems: 6
                },
                correctAnswers: {
                    type: "array",
                    description: "An array of correct answer strings. Must match items in 'options'.",
                    items: { type: "string" },
                    minItems: 1
                },
                isAnyAnswerAcceptable: { // Assuming this was intended from previous def; if not, will remove. Issue clarification needed if this is not in original.
                    type: "boolean",
                    description: "If true, any answer from 'options' is considered correct. Useful for opinion-based questions. If true, correctAnswers can be an empty array."
                }
            },
            required: ["question", "options", "correctAnswers", "isAnyAnswerAcceptable"] // Adjust if isAnyAnswerAcceptable is not in original
        }
    },
    {
        name: ActivityTypes.CLOZE,
        description: "Fill-in-the-blanks activity. Useful for vocabulary and syntax reinforcement.",
        parameters: {
            type: "object",
            properties: {
                instruction: { // Assuming 'instruction' was intended; if original is different, will adjust.
                    type: "string",
                    description: "Instruction for the cloze activity, e.g., 'Fill in the missing word.'"
                },
                textWithBlanks: {
                    type: "string",
                    description: "The text containing blanks, represented by a special placeholder like '__BLANK__'. Example: 'A __BLANK__ is a container for storing information.'"
                },
                correctAnswers: {
                    type: "array",
                    description: "An array of correct strings for the blanks, in order.",
                    items: { type: "string" },
                    minItems: 1
                }
            },
            required: ["instruction", "textWithBlanks", "correctAnswers"] // Adjust if instruction is not in original
        }
    },
    {
        name: ActivityTypes.DRAG_TRUE_FALSE,
        description: "Learner drags statements to 'True' or 'False' bins. Good for concept validation.",
        parameters: {
            type: "object",
            properties: {
                instruction: { // Assuming 'instruction'
                    type: "string",
                    description: "Instruction for the activity, e.g., 'Drag each statement to True or False.'"
                },
                statements: {
                    type: "array",
                    description: "An array of statements, each being an object with 'text' and 'isTrue' (boolean) properties.",
                    items: {
                        type: "object",
                        properties: {
                            text: { type: "string", description: "The statement text." },
                            isTrue: { type: "boolean", description: "Whether the statement is true." }
                        },
                        required: ["text", "isTrue"]
                    },
                    minItems: 2,
                    maxItems: 6
                }
            },
            required: ["instruction", "statements"] // Adjust if instruction is not in original
        }
    },
    {
        name: ActivityTypes.LIST_VIEW,
        description: "Displays a list of items, potentially with images and subtext. Useful for vocabulary lists or summaries.",
        parameters: {
            type: "object",
            properties: {
                title: { type: "string", description: "Title for the list." },
                items: {
                    type: "array",
                    description: "Array of list items.",
                    items: {
                        type: "object",
                        properties: {
                            text: { type: "string", description: "Main text for the list item." },
                            subText: { type: "string", description: "Optional subtext for the list item." },
                            imageQuery: { type: "string", description: "Optional DALL-E query for an image associated with the item." }
                        },
                        required: ["text"]
                    },
                    minItems: 1
                }
            },
            required: ["title", "items"]
        }
    },
    {
        name: ActivityTypes.PHOTO_QUIZ,
        description: "A quiz where options are images. Learner selects the correct image(s).",
        parameters: {
            type: "object",
            properties: {
                question: { type: "string", description: "The quiz question." },
                imageQueries: {
                    type: "array",
                    description: "Array of DALL-E queries for image options. Min 2, Max 6.",
                    items: { type: "string" },
                    minItems: 2,
                    maxItems: 6
                },
                correctAnswers: {
                    type: "array",
                    description: "Array of indices (0-based) corresponding to the correct imageQueries.",
                    items: { type: "integer" },
                    minItems: 1
                },
                isAnyAnswerAcceptable: {
                    type: "boolean",
                    description: "If true, any option is correct. `correctAnswers` can be empty."
                }
            },
            required: ["question", "imageQueries", "correctAnswers", "isAnyAnswerAcceptable"]
        }
    },
    {
        name: ActivityTypes.WORD_VIEW,
        description: "Displays a single word prominently, often with an associated image. For vocabulary focus.",
        parameters: {
            type: "object",
            properties: {
                text: { type: "string", description: "The word to display." },
                imageQuery: { type: "string", description: "DALL-E query for an image related to the word." }
            },
            required: ["text", "imageQuery"]
        }
    },
    {
        name: ActivityTypes.TEXT_VIEW,
        description: "Displays a block of text, potentially with a title and an image. For explanations or content presentation.",
        parameters: {
            type: "object",
            properties: {
                text: { type: "string", description: "The main text content to display." },
                imageQuery: { type: "string", description: "Optional DALL-E query for an accompanying image." },
                aspect: { type: "string", description: "Aspect ratio for the image (SQUARE, LANDSCAPE, PORTRAIT).", enum: ["SQUARE", "LANDSCAPE", "PORTRAIT"] }
            },
            required: ["text"]
        }
    },
    {
        name: ActivityTypes.IMAGE_VIEW,
        description: "Displays an image, generated via a DALL-E query, with optional accompanying text and defined aspect ratio.",
        parameters: {
            type: "object",
            properties: {
                imageQuery: { type: "string", description: "DALL-E query to generate the image." },
                text: { type: "string", description: "Optional text to display with the image (e.g., a caption or related information)." },
                aspect: { type: "string", description: "Aspect ratio for the image (SQUARE, LANDSCAPE, PORTRAIT).", enum: ["SQUARE", "LANDSCAPE", "PORTRAIT"] }
            },
            required: ["imageQuery"]
        }
    },
    {
        name: ActivityTypes.REPEAT_AFTER_ME,
        description: "Presents text for the learner to read aloud. The tutor then 'listens' and provides feedback.",
        parameters: {
            type: "object",
            properties: {
                phrase: { type: "string", description: "The phrase or sentence for the learner to repeat." },
                acceptedAnswers: {
                    type: "array",
                    description: "Optional array of strings representing acceptable variations of the phrase for automatic TTS checking (if applicable). If empty, implies exact match or manual check.",
                    items: { type: "string" }
                }
            },
            required: ["phrase"]
        }
    },
    {
        name: ActivityTypes.YOUTUBE_VIDEO,
        description: "Embeds or links to a YouTube video. Can be a specific URL or a search query.",
        parameters: {
            type: "object",
            properties: {
                query: { type: "string", description: "Search query for YouTube. Used if URL is not provided or as a fallback." },
                url: { type: "string", description: "Optional direct URL to the YouTube video." }
            },
            required: ["query"] // URL is optional, query is the primary way to find a video
        }
    },
    {
        name: ActivityTypes.INTERACTIVE_TEXT,
        description: "Presents a block of text where certain words or phrases are interactive (e.g., clickable for definitions or further actions).",
        parameters: {
            type: "object",
            properties: {
                text: { type: "string", description: "The main body of text." },
                interactiveElements: {
                    type: "array",
                    description: "Array of objects defining interactive parts of the text.",
                    items: {
                        type: "object",
                        properties: {
                            textToHighlight: { type: "string", description: "The exact text snippet from the main text to make interactive." },
                            action: { type: "string", description: "Action to perform when interacted with (e.g., 'DEFINE', 'EXPLAIN_MORE')." },
                            actionParameter: { type: "string", description: "Parameter for the action, e.g., the word to define."}
                        },
                        required: ["textToHighlight", "action"]
                    },
                    minItems: 1
                }
            },
            required: ["text", "interactiveElements"]
        }
    },
    {
        name: ActivityTypes.MATCHING,
        description: "Learners match items from one list (prompts) to items in another list (answers). Can be text-to-text or text-to-image.",
        parameters: {
            type: "object",
            properties: {
                title: { type: "string", description: "Title for the matching activity." },
                prompts: {
                    type: "array",
                    description: "Array of prompt items (strings or objects with text/imageQuery).",
                    items: {
                        type: "object", // Assuming flexible items, could be simpler if always string
                        properties: {
                            id: { type: "string", description: "Unique ID for this prompt item." },
                            text: { type: "string", description: "Text for the prompt." },
                            imageQuery: { type: "string", description: "Optional DALL-E query if prompt is an image."}
                        },
                        required: ["id"] // require id, and either text or imageQuery
                    },
                    minItems: 2
                },
                answers: {
                    type: "array",
                    description: "Array of answer items (strings or objects with text/imageQuery).",
                     items: {
                        type: "object",
                        properties: {
                            id: { type: "string", description: "Unique ID for this answer item." },
                            text: { type: "string", description: "Text for the answer." },
                            imageQuery: { type: "string", description: "Optional DALL-E query if answer is an image."}
                        },
                        required: ["id"] // require id, and either text or imageQuery
                    },
                    minItems: 2
                },
                correctPairs: {
                    type: "array",
                    description: "Array of objects mapping prompt ID to answer ID.",
                    items: {
                        type: "object",
                        properties: {
                            promptId: { type: "string", description: "ID of the prompt item." },
                            answerId: { type: "string", description: "ID of the corresponding answer item." }
                        },
                        required: ["promptId", "answerId"]
                    },
                    minItems: 1 // Should match the number of prompts ideally
                }
            },
            required: ["title", "prompts", "answers", "correctPairs"]
        }
    },
    {
        name: ActivityTypes.END_SCREEN,
        description: "A concluding screen for a lesson or module. Summarizes achievements and may offer next steps.",
        parameters: {
            type: "object",
            properties: {
                title: { type: "string", description: "Title for the end screen, e.g., 'Great Job!'" },
                summaryText: { type: "string", description: "Text summarizing what was learned or accomplished." },
                imageQuery: { type: "string", description: "Optional DALL-E query for a celebratory or thematic image." },
                nextLessonSuggestion: { type: "string", description: "Optional text suggesting what the next lesson could be about." }
            },
            required: ["title", "summaryText"]
        }
    },
    {
        name: ActivityTypes.SUMMARY,
        description: "Provides a summary of key concepts or vocabulary learned during a lesson or part of a lesson. Can include text and images.",
        parameters: {
            type: "object",
            properties: {
                title: { type: "string", description: "Title for the summary, e.g., 'What We Learned'." },
                points: {
                    type: "array",
                    description: "Array of key summary points.",
                    items: {
                        type: "object",
                        properties: {
                            text: { type: "string", description: "Text of the summary point." },
                            imageQuery: { type: "string", description: "Optional DALL-E query for an image illustrating the point." }
                        },
                        required: ["text"]
                    },
                    minItems: 1
                }
            },
            required: ["title", "points"]
        }
    }
];

console.log("ActivityTools redefined. Number of tools:", activityTools.length);
// For detailed inspection:
// console.log(JSON.stringify(activityTools, null, 2));

// Verification for specific tools mentioned in the subtask
const imageView = activityTools.find(t => t.name === ActivityTypes.IMAGE_VIEW);
if (imageView && imageView.parameters.properties.imageQuery && imageView.parameters.properties.text && imageView.parameters.properties.aspect) {
    console.log("IMAGE_VIEW parameters verified (imageQuery, text, aspect).");
} else {
    console.error("IMAGE_VIEW parameter mismatch or tool not found.");
}

const wordView = activityTools.find(t => t.name === ActivityTypes.WORD_VIEW);
if (wordView && wordView.parameters.properties.text && wordView.parameters.properties.imageQuery) {
    console.log("WORD_VIEW parameters verified (text, imageQuery).");
} else {
    console.error("WORD_VIEW parameter mismatch or tool not found.");
}

const textView = activityTools.find(t => t.name === ActivityTypes.TEXT_VIEW);
if (textView && textView.parameters.properties.text && textView.parameters.properties.imageQuery && textView.parameters.properties.aspect) {
    console.log("TEXT_VIEW parameters verified (text, imageQuery, aspect).");
} else {
    console.error("TEXT_VIEW parameter mismatch or tool not found.");
}

const youtubeVideo = activityTools.find(t => t.name === ActivityTypes.YOUTUBE_VIDEO);
if (youtubeVideo && youtubeVideo.parameters.properties.query && youtubeVideo.parameters.properties.url && youtubeVideo.parameters.required.includes('query')) {
    console.log("YOUTUBE_VIDEO parameters verified (query, url; query required).");
} else {
    console.error("YOUTUBE_VIDEO parameter mismatch or tool not found.");
}

// Check total number of tools expected
const expectedToolCount = Object.keys(ActivityTypes).length;
if (activityTools.length === expectedToolCount) {
    console.log(`Correct number of tools defined: ${activityTools.length}`);
} else {
    console.error(`Mismatch in tool count. Expected: ${expectedToolCount}, Got: ${activityTools.length}`);
}

console.log("Finished redefining activity tools to match issue specification.");

// --- Lesson State and Logic ---

const lessonState = {
    userName: null,
    userInterests: null,
    currentWords: [],
    currentWordIndex: 0,
    badgesEarned: [],
    lessonProgress: 0, // e.g., percentage or step number
    usedActivityTools: new Set(),
    // Tools that must be used at least once per lesson, using ActivityTypes constants directly.
    requiredToolsThisLesson: [
        ActivityTypes.DRAG_TRUE_FALSE,
        ActivityTypes.CLOZE,
        ActivityTypes.QUIZ,
        ActivityTypes.PHOTO_QUIZ,
        ActivityTypes.REPEAT_AFTER_ME,
        ActivityTypes.TEXT_VIEW,
        ActivityTypes.INTERACTIVE_TEXT,
        ActivityTypes.MATCHING
        // Note: "present_camera_activity" and "present_unscramble_activity" from previous prompt
        // are not standard ActivityTypes defined. Assuming PHOTO_QUIZ covers camera.
        // UNSCRAMBLE would need to be defined as a new ActivityType if required.
    ],
    // Add other relevant state properties as needed
};

// Helper function to simulate tool calls
function simulateToolCall(toolName, parameters) {
    console.log(`SIMULATING: ${toolName} called with parameters:`, JSON.stringify(parameters, null, 2));
    lessonState.usedActivityTools.add(toolName); // Track usage
}

function getUserDetails() {
    // Simulate fetching user details
    lessonState.userName = "Alex";
    lessonState.userInterests = "space"; // Hardcoded for now
    console.log(`User details obtained: Name - ${lessonState.userName}, Interests - ${lessonState.userInterests}`);
}

function selectWords(interests) {
    // Simulate word selection based on interests
    if (interests === "space") {
        lessonState.currentWords = ["galaxy", "planet", "rocket"];
    } else if (interests === "animals") {
        lessonState.currentWords = ["lion", "tiger", "bear"];
    } else {
        lessonState.currentWords = ["apple", "banana", "cherry"]; // Default words
    }
    lessonState.currentWordIndex = 0; // Reset word index when new words are selected
    console.log(`Words selected based on interests '${interests}': ${lessonState.currentWords.join(', ')}`);
}

// Main lesson function stub
function startLesson() {
    console.log("Starting lesson...");

    getUserDetails();
    selectWords(lessonState.userInterests);

    console.log("Initial lesson state:", {
        name: lessonState.userName,
        interests: lessonState.userInterests,
        words: lessonState.currentWords
    });

    // Simulate initial tool calls
    if (lessonState.currentWords.length > 0) {
        // Simulate preload_lesson_images
        const imageQueries = lessonState.currentWords.map(word => `${word} in space for kids`); // Example query generation
        console.log(`SIMULATING: preload_lesson_images called with words: ${lessonState.currentWords.join(', ')} and image queries: ${imageQueries.join('; ')}`);

        // Simulate present_list_view
        const listViewItems = lessonState.currentWords.map(word => ({ text: word, imageQuery: `${word} icon` }));
        console.log(`SIMULATING: present_list_view called with items:`, listViewItems.map(item => item.text));
        // Actual call would be something like:
        // GeminiAPI.callTool(ActivityTypes.LIST_VIEW, { title: "Today's Words!", items: listViewItems });
    } else {
        console.log("No words selected, skipping initial tool call simulations.");
    }

    console.log("Lesson setup complete. Ready to proceed with teaching words.");

    // --- Main Lesson Flow ---
    console.log("Starting main lesson flow for all words...");
    while (lessonState.currentWordIndex < lessonState.currentWords.length) {
        const currentWord = lessonState.currentWords[lessonState.currentWordIndex];
        teachWord(currentWord);
        lessonState.currentWordIndex++;
        if (lessonState.currentWordIndex < lessonState.currentWords.length) {
            console.log(`Proceeding to next word. New index: ${lessonState.currentWordIndex}`);
        }
    }
    console.log("All words taught.");

    // --- Post-Lesson Structure ---
    console.log("Starting post-lesson activities...");

    simulateToolCall("present_interactive_words_fun_time_game", {
        gameType: "airplane", // Example game type
        words: lessonState.currentWords
    });

    // Calculate total activities: 3 activities per word + word_view + image_view + badge per word
    const activitiesPerWord = 5; // WORD_VIEW + 3 activities + IMAGE_VIEW (badge is separate)
    const totalActivitiesDone = lessonState.currentWords.length * activitiesPerWord;

    simulateToolCall("present_game_end_screen", { // Assuming this is a generic tool name
        summary: {
            totalActivities: totalActivitiesDone, // Dynamic based on words taught
            score: Math.floor(Math.random() * 50) + 50, // Random score for simulation
            wordsLearned: lessonState.currentWords.length
        }
    });

    simulateToolCall(ActivityTypes.SUMMARY, { // Using the defined ActivityType
        title: "Lesson Summary!",
        points: [
            { text: `You learned all about ${lessonState.userInterests} today!`, imageQuery: `${lessonState.userInterests} theme`},
            { text: `Vocabulary Mastered: ${lessonState.currentWords.join(', ')}`, imageQuery: "congratulations icon" },
            { text: "Great job, Superstar!", imageQuery: "star badge" }
        ]
        // Original structure from prompt was: skills: [{ skill_name: lessonState.userInterests, skill_score: 100, vocabulary_mastered: lessonState.currentWords, report_text: "Great job!" }]
        // The SUMMARY tool defined expects 'title' and 'points'. Adjusting to fit.
    });

    console.log(`SIMULATING: Eddy sings a song about ${lessonState.currentWords.join(', ')}!`);
    console.log(`SIMULATING: Lesson finished. Thank you, ${lessonState.userName}!`);

    console.log("Final lesson state:", lessonState);
    console.log("All required tools for this lesson (as per issue):", lessonState.requiredToolsThisLesson);
    console.log("Tools actually used during the lesson:", Array.from(lessonState.usedActivityTools));
    // Add logic here to check if all requiredToolsThisLesson were used.
    const requiredToolsCheck = lessonState.requiredToolsThisLesson.filter(tool => !lessonState.usedActivityTools.has(tool));
    if (requiredToolsCheck.length === 0) {
        console.log("SUCCESS: All required tools for the lesson were used.");
    } else {
        console.warn(`WARNING: Not all required tools were used. Missing: ${requiredToolsCheck.join(', ')}`);
    }
}

// Removed requiredToolMap as lessonState.requiredToolsThisLesson now uses ActivityTypes constants.

// Function to teach a single word with refined activity selection
function teachWord(word) {
    console.log(`Starting to teach word: ${word} (Word ${lessonState.currentWordIndex + 1} of ${lessonState.currentWords.length})`);

    // 1. Present the word itself
    simulateToolCall(ActivityTypes.WORD_VIEW, { text: word, imageQuery: `icon of ${word} for kids` });

    // 2. Dynamic Activity Loop - Aim for 3 distinct activities
    console.log(`Planning activities for word: ${word}`);
    const activitiesForThisWord = [];
    const maxActivitiesPerWord = 3;
    let usedForThisWordSet = new Set(); // Tracks tools selected for *this word's* 3 activity slots

    // General pool of interactive activities (many are also in requiredToolsThisLesson)
    const generalActivityPool = [
        ActivityTypes.QUIZ, ActivityTypes.CLOZE, ActivityTypes.PHOTO_QUIZ,
        ActivityTypes.DRAG_TRUE_FALSE, ActivityTypes.REPEAT_AFTER_ME,
        ActivityTypes.INTERACTIVE_TEXT, ActivityTypes.MATCHING, ActivityTypes.TEXT_VIEW,
    ].sort(() => 0.5 - Math.random()); // Shuffle for variety if not picking required

    // Fill the 3 activity slots for this word
    for (let i = 0; i < maxActivitiesPerWord; i++) {
        let chosenActivity = null;

        // Priority 1: Pick a lesson-wide required tool that hasn't been used AT ALL in the lesson yet
        let foundNewRequiredTool = false;
        for (const reqTool of lessonState.requiredToolsThisLesson) {
            if (!lessonState.usedActivityTools.has(reqTool) && !usedForThisWordSet.has(reqTool)) {
                chosenActivity = reqTool;
                console.log(`Slot ${i + 1} (Word: ${word}): Prioritizing NEW lesson-required tool: ${chosenActivity}`);
                foundNewRequiredTool = true;
                break;
            }
        }

        // Priority 2: If no new lesson-wide required tool was picked for this slot,
        // or if all lesson-required tools are already used at least once in the lesson,
        // pick a general activity not yet used FOR THIS WORD.
        if (!chosenActivity) {
            for (const generalTool of generalActivityPool) {
                if (!usedForThisWordSet.has(generalTool)) {
                    chosenActivity = generalTool;
                    console.log(`Slot ${i + 1} (Word: ${word}): Picking general tool: ${chosenActivity}`);
                    break;
                }
            }
        }

        // Fallback if somehow a slot is not filled (e.g. pool exhausted for word)
        if (!chosenActivity) {
            // This fallback will pick from general pool even if used for word, just to fill the slot
            // but ideally the pool is diverse enough.
            const fallbackChoice = generalActivityPool.find(gt => gt !== undefined) || ActivityTypes.QUIZ; // Default to QUIZ
            chosenActivity = fallbackChoice;
            console.log(`Slot ${i + 1} (Word: ${word}): Fallback choice: ${chosenActivity}`);
        }

        if (chosenActivity) {
            activitiesForThisWord.push(chosenActivity);
            usedForThisWordSet.add(chosenActivity);
        } else {
            console.warn(`Could not select an activity for slot ${i+1} for word ${word}.`);
            // Potentially push a default like QUIZ if nothing is chosen.
            activitiesForThisWord.push(ActivityTypes.QUIZ); // Fallback
            usedForThisWordSet.add(ActivityTypes.QUIZ);
        }
    }

    console.log(`Activities selected for ${word}: ${activitiesForThisWord.join(', ')}`);

    // Simulate calls for the selected activities
    for (const toolToCall of activitiesForThisWord) {
        let params = { word: word, context: "dynamic activity" }; // Generic params
        // Customize parameters based on the tool type as per prompt
        switch (toolToCall) {
            case ActivityTypes.DRAG_TRUE_FALSE:
                params = { instructions: `Is this about a ${word}? Drag to True or False.`, subject: word, statements: [{word: `${word} is fun.`, isTrue: true}, {word: `${word} is boring.`, isTrue: false}, {word: `${word} is a type of animal.`, isTrue: false}, {word: `${word} can be found in space.`, isTrue: true}, {word: `${word} is a number.`, isTrue: false}] };
                break;
            case ActivityTypes.CLOZE:
                params = { instruction: "Fill in the blank:", textWithBlanks: `A ${word} is a fascinating part of __BLANK__.`, correctAnswers: ["the universe", "space", "science"] };
                break;
            case ActivityTypes.QUIZ:
                params = { question: `What is a common characteristic of a ${word}?`, options: ["It is very small", "It is very large", "It is always green"], correctAnswers: ["It is very large"], isAnyAnswerAcceptable: false };
                break;
            case ActivityTypes.PHOTO_QUIZ:
                params = { question: `Which of these is a ${word}?`, imageQueries: [`photo of a ${word}`, `photo of a common houseplant`, `photo of a car`], correctAnswers: [0], isAnyAnswerAcceptable: false };
                break;
            case ActivityTypes.REPEAT_AFTER_ME:
                params = { phrase: `I am learning about the ${word}.` };
                break;
            case ActivityTypes.TEXT_VIEW:
                params = { text: `Let's read more about the ${word}. ${word}s are truly amazing celestial objects. They contain billions of stars!`, imageQuery: `illustration of ${word}`, aspect: "LANDSCAPE"};
                break;
            case ActivityTypes.INTERACTIVE_TEXT:
                params = { instructions: `Tap the word '${word}' in the story.`, text: `Far away, in a distant ${word}, adventures await. This ${word} is full of stars and planets.`, interactiveElements: [{textToHighlight: word, action: "HIGHLIGHT_CORRECT", actionParameter: word}]};
                // Note: INTERACTIVE_TEXT definition in activityTools expects `actionParameter` and `textToHighlight`
                // The prompt example used `correctAnswersArray`. Adjusting to fit definition.
                // For simplicity, using a simplified `interactiveElements` for now.
                break;
            case ActivityTypes.MATCHING:
                params = { title: `Match related concepts to ${word}`, instructions: `Match the ${word} to its description.`, pairs: [{id:"p1", text: word, imageQuery: `icon of ${word}`}, {id:"p2", text: "Star"}, {id:"p3", text: "Planet"}], answers: [{id:"a1", text:"A huge system of stars"}, {id:"a2", text:"A ball of hot gas"}, {id:"a3", text:"Orbits a star"}], correctPairs: [{promptId:"p1", answerId:"a1"},{promptId:"p2", answerId:"a2"},{promptId:"p3", answerId:"a3"}] };
                break;
            default:
                console.warn(`Parameters not specifically defined for ${toolToCall}, using generic.`);
        }
        simulateToolCall(toolToCall, params);
    }

    console.log(`Finished all activities for word: ${word}.`);

    // 3. Show an image related to the word (distinct from word_view)
    simulateToolCall(ActivityTypes.IMAGE_VIEW, {
        imageQuery: `detailed illustration of ${word} for children`,
        text: `Wow, look at this ${word}!`
    });

    // 4. Give a badge for learning the word
    const badgeName = `Mastered ${word} Badge`;
    simulateToolCall("show_give_badge", { // Assuming "show_give_badge" is a defined tool name like an API endpoint or specific function
        badgeName: badgeName,
        achievement: `You've learned the word: ${word}! Great job!`,
        badgeIconQuery: `gold medal with ${word} icon`
    });
    lessonState.badgesEarned.push(badgeName);

    console.log(`Finished teaching sequence for word: ${word}. Badges: ${lessonState.badgesEarned.join(', ')}`);
    console.log("Lesson-wide tools used so far:", Array.from(lessonState.usedActivityTools));
}


// Call startLesson to kick things off
// startLesson(); // Commenting out direct call to startLesson for now

// --- Gemini API Interaction Simulation ---

function getLessonPlanFromGemini(userInput) {
    console.log("SIMULATING: Sending request to Gemini API...");
    console.log("Main Prompt (first 500 chars):", mainPromptString.substring(0, 500) + "..."); // Log snippet
    // console.log("Full Main Prompt:", mainPromptString); // For full inspection if needed
    console.log("Tool Definitions (first tool):", activityTools.length > 0 ? activityTools[0] : "No tools defined");
    // console.log("Full Tool Definitions:", activityTools); // For full inspection if needed
    console.log("User Input for Lesson:", userInput);

    // Dynamically create words based on interest
    let wordsToTeach = [];
    let exampleImageQueries = [];
    if (userInput.interests.toLowerCase().includes("space")) {
        wordsToTeach = ["nebula", "orbit", "galaxy"];
        exampleImageQueries = ["swirling nebula clouds", "planet orbit path", "Andromeda galaxy"];
    } else if (userInput.interests.toLowerCase().includes("dinosaurs")) {
        wordsToTeach = ["trex", "velociraptor", "triceratops"];
        exampleImageQueries = ["tyrannosaurus rex roaring", "velociraptor pack hunting", "triceratops with large frill"];
    } else {
        wordsToTeach = ["adventure", "explore", "discover"];
        exampleImageQueries = ["map and compass", "person hiking mountain", "magnifying glass over ancient ruins"];
    }


    const mockApiResponseJson = `
{
  "lessonTitle": "Wondrous Worlds of " + ${JSON.stringify(userInput.interests)} + "!",
  "userName": ${JSON.stringify(userInput.name)},
  "initialGreeting": "Hey there, " + ${JSON.stringify(userInput.name)} + "! I'm Eddy, your super-duper space explorer guide! I heard you're interested in " + ${JSON.stringify(userInput.interests)} + "! That's stellar! What's your favorite cosmic thing to imagine?",
  "wordsToTeach": ${JSON.stringify(wordsToTeach)},
  "steps": [
    { "type": "system_message", "message": "Eddy awaits user's response about their favorite thing." },
    { "tool_call": { "name": "preload_lesson_images", "parameters": { "words": ${JSON.stringify(wordsToTeach)}, "image_queries": ${JSON.stringify(exampleImageQueries)} } } },
    { "tool_call": { "name": "${ActivityTypes.LIST_VIEW}", "parameters": { "title": "Today's Adventure Words!", "items": [ {"text": "${wordsToTeach[0]}", "imageQuery": "${exampleImageQueries[0]}"}, {"text": "${wordsToTeach[1]}", "imageQuery": "${exampleImageQueries[1]}"}, {"text": "${wordsToTeach[2]}", "imageQuery": "${exampleImageQueries[2]}"} ] } } },
    { "type": "eddy_message", "message": "Alright, ${userInput.name}! Check out these awesome words we're going to explore today!" },

    // Word 1: e.g., Nebula (using interests-based word)
    { "tool_call": { "name": "${ActivityTypes.WORD_VIEW}", "parameters": { "text": "${wordsToTeach[0]}", "imageQuery": "colorful ${wordsToTeach[0]}" } } },
    { "type": "eddy_message", "message": "First up is '${wordsToTeach[0]}'! A ${wordsToTeach[0]} is a giant cloud of dust and gas in space. Some are where new stars are born! Isn't that amazing?" },
    { "tool_call": { "name": "${ActivityTypes.QUIZ}", "parameters": { "question": "What is a ${wordsToTeach[0]} mostly made of?", "options": ["Solid rock", "Dust and gas", "Liquid water"], "correctAnswers": ["Dust and gas"], "isAnyAnswerAcceptable": false } } },
    { "tool_call": { "name": "${ActivityTypes.CLOZE}", "parameters": { "instruction": "Fill in the blank:", "textWithBlanks": "New stars can be born inside a __BLANK__.", "correctAnswers": ["${wordsToTeach[0]}"] } } },
    { "tool_call": { "name": "${ActivityTypes.PHOTO_QUIZ}", "parameters": { "question": "Which of these looks like a ${wordsToTeach[0]}?", "imageQueries": ["photo of a ${wordsToTeach[0]}", "photo of a tree", "photo of a car"], "correctAnswers": [0], "isAnyAnswerAcceptable": false } } },
    { "tool_call": { "name": "${ActivityTypes.IMAGE_VIEW}", "parameters": { "imageQuery": "Hubble telescope picture of a ${wordsToTeach[0]}", "text": "Look at this stunning real picture of a ${wordsToTeach[0]}!", "aspect": "LANDSCAPE" } } },
    { "tool_call": { "name": "show_give_badge", "parameters": { "badgeName": "${wordsToTeach[0]} Explorer", "achievement": "You've learned about the ${wordsToTeach[0]}!" } } },

    // Word 2: e.g., Orbit
    { "tool_call": { "name": "${ActivityTypes.WORD_VIEW}", "parameters": { "text": "${wordsToTeach[1]}", "imageQuery": "planet in ${wordsToTeach[1]} around a star" } } },
    { "type": "eddy_message", "message": "Next, let's talk about '${wordsToTeach[1]}'! An ${wordsToTeach[1]} is the path an object takes around another in space, like Earth around the Sun. It's like a giant invisible racetrack!" },
    { "tool_call": { "name": "${ActivityTypes.DRAG_TRUE_FALSE}", "parameters": { "instructions": "Is this statement about an '${wordsToTeach[1]}' true or false?", "subject": "${wordsToTeach[1]}", "statements": [{"word": "Planets ${wordsToTeach[1]} stars.", "isTrue": true}, {"word": "Moons ${wordsToTeach[1]} planets.", "isTrue": true}, {"word": "Stars ${wordsToTeach[1]} planets.", "isTrue": false}, {"word": "An ${wordsToTeach[1]} is always a perfect circle.", "isTrue": false}, {"word": "Gravity keeps things in ${wordsToTeach[1]}.", "isTrue": true}] } } },
    { "tool_call": { "name": "${ActivityTypes.REPEAT_AFTER_ME}", "parameters": { "phrase": "${wordsToTeach[1]}" } } },
    { "tool_call": { "name": "${ActivityTypes.TEXT_VIEW}", "parameters": { "text": "The Earth takes about 365 days to complete one ${wordsToTeach[1]} around the Sun. That's one whole year!", "imageQuery": "Earth revolving sun diagram", "aspect": "LANDSCAPE" } } },
    { "tool_call": { "name": "${ActivityTypes.IMAGE_VIEW}", "parameters": { "imageQuery": "International Space Station in ${wordsToTeach[1]}", "text": "The International Space Station is also in an ${wordsToTeach[1]} around Earth!", "aspect":"LANDSCAPE" } } },
    { "tool_call": { "name": "show_give_badge", "parameters": { "badgeName": "${wordsToTeach[1]} Navigator", "achievement": "You now know all about the ${wordsToTeach[1]}!" } } },

    // Word 3: e.g., Galaxy
    { "tool_call": { "name": "${ActivityTypes.WORD_VIEW}", "parameters": { "text": "${wordsToTeach[2]}", "imageQuery": "spiral ${wordsToTeach[2]}" } } },
    { "type": "eddy_message", "message": "Our last word for today is '${wordsToTeach[2]}'! A ${wordsToTeach[2]} is a huge collection of stars, gas, and dust. We live in the Milky Way ${wordsToTeach[2]}!" },
    { "tool_call": { "name": "${ActivityTypes.INTERACTIVE_TEXT}", "parameters": { "instructions": "Tap the word '${wordsToTeach[2]}' in the sentences below.", "text": "The Milky Way is our home ${wordsToTeach[2]}. It is a spiral ${wordsToTeach[2]} and contains billions of stars.", "interactiveElements": [{"textToHighlight": "${wordsToTeach[2]}", "action": "HIGHLIGHT_CORRECT", "actionParameter": "${wordsToTeach[2]}"}, {"textToHighlight": "${wordsToTeach[2]}", "action": "HIGHLIGHT_CORRECT", "actionParameter": "${wordsToTeach[2]}"}] } } },
    { "tool_call": { "name": "${ActivityTypes.MATCHING}", "parameters": { "title": "Space Concepts Match-up!", "instructions": "Match the space term to its best description.", "pairs": [{"id":"p1", "text": "${wordsToTeach[0]}"}, {"id":"p2", "text": "${wordsToTeach[1]}"}, {"id":"p3", "text": "${wordsToTeach[2]}"}], "answers": [{"id":"a1", "text":"Cloud of dust and gas"}, {"id":"a2", "text":"Path around an object"}, {"id":"a3", "text":"Huge group of stars"}], "correctPairs": [{"promptId":"p1", "answerId":"a1"}, {"promptId":"p2", "answerId":"a2"}, {"promptId":"p3", "answerId":"a3"}] } } },
    { "tool_call": { "name": "${ActivityTypes.QUIZ}", "parameters": { "question": "Which ${wordsToTeach[2]} do we live in?", "options": ["Andromeda", "Triangulum", "Milky Way"], "correctAnswers": ["Milky Way"], "isAnyAnswerAcceptable": false } } },
    { "tool_call": { "name": "${ActivityTypes.IMAGE_VIEW}", "parameters": { "imageQuery": "Andromeda ${wordsToTeach[2]} photo", "text": "This is the Andromeda ${wordsToTeach[2]}, our closest large galactic neighbor!", "aspect":"SQUARE" } } },
    { "tool_call": { "name": "show_give_badge", "parameters": { "badgeName": "${wordsToTeach[2]} Guardian", "achievement": "You're a master of the ${wordsToTeach[2]}!" } } },

    // Post-lesson
    { "type": "eddy_message", "message": "Wowza, ${userInput.name}! You learned all three words! Time for a fun game!" },
    { "tool_call": { "name": "present_interactive_words_fun_time_game", "parameters": { "gameType": "star_catcher", "words": ${JSON.stringify(wordsToTeach)} } } },
    { "tool_call": { "name": "present_game_end_screen", "parameters": { "summary": {"totalActivities": 9, "score": 300, "wordsLearned": ${wordsToTeach.length} } } } },
    { "type": "eddy_message", "message": "That was fantastic! Are you ready to see what you've learned, or do you want to try another game?" },
    { "type": "system_signal", "signal": "user_chose_finish" },
    { "tool_call": { "name": "${ActivityTypes.SUMMARY}", "parameters": { "title": "Your Awesome " + ${JSON.stringify(userInput.interests)} + " Adventure!", "points": [ {"text": "You mastered these words: ${wordsToTeach.join(', ')}!", "imageQuery": "gold star trophy"}, {"text": "You completed lots of fun activities!", "imageQuery": "party popper celebration"} ] } } },
    { "type": "eddy_sings_song", "lyrics": "${wordsToTeach[0]}, ${wordsToTeach[1]}, and ${wordsToTeach[2]}, oh my! Learning about " + ${JSON.stringify(userInput.interests)} + " makes you fly high!" },
    { "type": "eddy_farewell", "message": "You were truly stellar today, ${userInput.name}! Keep exploring and come back soon for more adventures with Eddy!" }
  ]
}
`;

    console.log("SIMULATING: Received mock response from Gemini API.");
    try {
        const parsedResponse = JSON.parse(mockApiResponseJson);
        return parsedResponse;
    } catch (error) {
        console.error("Error parsing mock API response JSON:", error);
        console.error("Problematic JSON string (approximate location):", mockApiResponseJson.substring(Math.max(0, error.at - 20), Math.min(mockApiResponseJson.length, error.at + 20)));
        return null; // Return null or throw error if parsing fails
    }
}

// Example usage:
const userDetails = { name: "Charlie", interests: "dinosaurs" };
// const userDetails = { name: "Alex", interests: "space" }; // Alternative for testing
const lessonPlan = getLessonPlanFromGemini(userDetails);

if (lessonPlan) {
    console.log("Successfully Received and Parsed Lesson Plan for:", userDetails.name);
    console.log("Lesson Title:", lessonPlan.lessonTitle);
    console.log("Number of steps in plan:", lessonPlan.steps.length);
    // console.log("Full Lesson Plan:", JSON.stringify(lessonPlan, null, 2)); // For detailed inspection
} else {
    console.error("Failed to get or parse lesson plan.");
}

// Next step would be to create a function that takes this 'lessonPlan'
// and executes it, calling simulateToolCall or actual tool functions
// based on the steps.

// --- Lesson Plan Execution ---

function executeLessonPlan(lessonPlan) {
    if (!lessonPlan || !lessonPlan.steps || !Array.isArray(lessonPlan.steps)) {
        console.error("Invalid lesson plan structure provided to executeLessonPlan.");
        return;
    }

    console.log(`\n--- EXECUTING LESSON: ${lessonPlan.lessonTitle} for ${lessonPlan.userName} ---`);

    // Initialize lessonState for this execution run (optional, if executeLessonPlan is self-contained)
    // For now, assumes lessonState is global and might have been pre-populated by startLesson or similar.
    // If getLessonPlanFromGemini is the sole source, then lessonState might not be directly used by executeLessonPlan
    // unless it's for things like badge earning which are part of the plan's side-effects.

    lessonPlan.steps.forEach((step, index) => {
        console.log(`\n[Step ${index + 1}/${lessonPlan.steps.length}]`);

        if (step.type === "eddy_message" || step.initialGreeting || step.type === "eddy_farewell") {
            let message = "";
            if (step.initialGreeting) message = step.initialGreeting;
            else if (step.message) message = step.message;
            else if (step.farewell) message = step.farewell; // Assuming 'farewell' key for type: "eddy_farewell"
            else if (step.type === "eddy_farewell" && step.message) message = step.message; // If farewell uses 'message' key
            console.log(`EDDY: ${message}`);
        } else if (step.tool_call) {
            console.log(`TOOL CALL: ${step.tool_call.name}`);
            console.log(`Parameters: ${JSON.stringify(step.tool_call.parameters, null, 2)}`);
            // Check if it's one of our defined activity tools
            if (Object.values(ActivityTypes).includes(step.tool_call.name)) {
                console.log(`(This is a defined Activity Tool: ${step.tool_call.name})`);
                // Here, you would actually call simulateToolCall or the real tool
                // simulateToolCall(step.tool_call.name, step.tool_call.parameters);
                // For now, just logging as per subtask.
            }
             // Handle specific non-activity tool calls if needed (e.g. preload_lesson_images)
            if (step.tool_call.name === "preload_lesson_images") {
                console.log("(This is a preloading task)");
            }
            if (step.tool_call.name === "show_give_badge") {
                 console.log(`(Badge: "${step.tool_call.parameters.badgeName}" would be awarded here)`);
                 // lessonState.badgesEarned.push(step.tool_call.parameters.badgeName); // If tracking
            }

        } else if (step.type === "system_message" || step.type === "system_signal") {
            const content = step.message || step.signal;
            console.log(`SYSTEM (${step.type}): ${content}`);
        } else if (step.type === "eddy_sings_song") {
            console.log(`EDDY SINGS: ${step.lyrics}`);
        } else {
            console.log(`UNKNOWN STEP TYPE or structure: ${JSON.stringify(step)}`);
        }
    });

    console.log("\n--- LESSON EXECUTION FINISHED ---");
}


// Example usage:
const userDetails = { name: "Charlie", interests: "dinosaurs" };
// const userDetails = { name: "Alex", interests: "space" }; // Alternative for testing
const lessonPlan = getLessonPlanFromGemini(userDetails);

if (lessonPlan) {
    console.log("\nSuccessfully Received and Parsed Lesson Plan for:", userDetails.name);
    console.log("Lesson Title:", lessonPlan.lessonTitle);
    console.log("Number of steps in plan:", lessonPlan.steps.length);
    // console.log("Full Lesson Plan:", JSON.stringify(lessonPlan, null, 2)); // For detailed inspection

    executeLessonPlan(lessonPlan);
} else {
    console.error("Failed to get a lesson plan. Cannot execute.");
}
