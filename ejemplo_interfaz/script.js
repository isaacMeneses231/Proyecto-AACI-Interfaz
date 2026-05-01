document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatArea = document.getElementById('chat-area');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const btnIncreaseText = document.getElementById('btn-increase-text');
    const btnDecreaseText = document.getElementById('btn-decrease-text');
    const btnReadAloud = document.getElementById('btn-read-aloud');

    // Accessibility State
    let currentFontSize = 16;
    const minFontSize = 12;
    const maxFontSize = 26;
    let isSpeaking = false;

    // Dummy Database for AI Responses
    const database = [
        {
            keywords: ['planeta', 'tierra', 'solar', 'marte', 'jupiter', 'saturno'],
            response: "El Sistema Solar está formado por el Sol y todos los objetos celestes que orbitan a su alrededor, incluyendo 8 planetas. La Tierra es el tercer planeta desde el Sol y el único conocido que alberga vida."
        },
        {
            keywords: ['gravedad', 'caer', 'fuerza', 'newton'],
            response: "La gravedad es una fuerza invisible que atrae los objetos hacia el centro de la Tierra. Fue descrita matemáticamente por Isaac Newton. ¡Es lo que nos mantiene en el suelo y hace que los planetas orbiten!"
        },
        {
            keywords: ['historia', 'roma', 'imperio', 'gladiador'],
            response: "El Imperio Romano fue una de las civilizaciones más influyentes de la antigüedad. Construyeron acueductos, coliseos y una vasta red de caminos. ¿Sabías que el Coliseo podía albergar a más de 50,000 espectadores?"
        },
        {
            keywords: ['fotosintesis', 'planta', 'verde', 'oxigeno'],
            response: "La fotosíntesis es el proceso mediante el cual las plantas producen su propio alimento. Usan la luz del sol, agua y dióxido de carbono para crear energía, ¡y liberan oxígeno como resultado, el cual nosotros respiramos!"
        },
        {
            keywords: ['revolucion', 'francesa', '1789'],
            response: "La Revolución Francesa inició en 1789 y transformó la sociedad de Francia, aboliendo la monarquía absoluta. Sus ideales se resumían en: Libertad, Igualdad y Fraternidad."
        },
        {
            keywords: ['celula', 'célula', 'biologia', 'mitocondria'],
            response: "La célula es la unidad básica de la vida. Existen células animales y vegetales. Una parte importante es la mitocondria, que funciona como el 'motor' de la célula produciendo energía."
        },
        {
            keywords: ['hola', 'saludos', 'buenas', 'hey'],
            response: "¡Hola! Estoy listo para ayudarte a aprender. Puedes preguntarme sobre el Sistema Solar, el Imperio Romano, la fotosíntesis, la Revolución Francesa o las células."
        },
        {
            keywords: ['gracias', 'adios', 'chau'],
            response: "¡De nada! Recuerda que siempre estoy aquí para ayudarte con tus estudios. ¡Hasta la próxima!"
        }
    ];

    const defaultResponse = "Esa es una excelente pregunta. Aunque no tengo la respuesta exacta en mi base de datos actual sobre ese tema específico, te animo a investigar más. ¿Te gustaría hablar sobre el Sistema Solar, biología o historia antigua?";

    // --- Accessibility Functions ---

    // Change Text Size
    const updateFontSize = () => {
        document.documentElement.style.setProperty('--base-font-size', `${currentFontSize}px`);
    };

    btnIncreaseText.addEventListener('click', () => {
        if (currentFontSize < maxFontSize) {
            currentFontSize += 2;
            updateFontSize();
        }
    });

    btnDecreaseText.addEventListener('click', () => {
        if (currentFontSize > minFontSize) {
            currentFontSize -= 2;
            updateFontSize();
        }
    });

    // Text to Speech
    btnReadAloud.addEventListener('click', () => {
        if (isSpeaking) {
            // Stop speaking if currently active
            window.speechSynthesis.cancel();
            isSpeaking = false;
            btnReadAloud.classList.remove('active');
            return;
        }

        // Get the last AI message
        const aiMessages = document.querySelectorAll('.ai-message .message-content p');
        if (aiMessages.length > 0) {
            const lastMessage = aiMessages[aiMessages.length - 1].innerText;
            readTextAloud(lastMessage);
        } else {
            alert('No hay mensajes para leer.');
        }
    });

    const readTextAloud = (text) => {
        if (!('speechSynthesis' in window)) {
            alert('Lo siento, tu navegador no soporta la función de lectura en voz alta.');
            return;
        }

        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES'; // Spanish Language
        utterance.rate = 0.95; // Slightly slower for better comprehension
        
        utterance.onstart = () => {
            isSpeaking = true;
            btnReadAloud.classList.add('active');
        };
        
        utterance.onend = () => {
            isSpeaking = false;
            btnReadAloud.classList.remove('active');
        };
        
        utterance.onerror = () => {
            isSpeaking = false;
            btnReadAloud.classList.remove('active');
        };

        window.speechSynthesis.speak(utterance);
    };

    // --- Chat Logic ---

    const addMessage = (text, isUser = false) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        
        contentDiv.appendChild(paragraph);
        messageDiv.appendChild(contentDiv);
        chatArea.appendChild(messageDiv);
        
        // Scroll smoothly to bottom
        chatArea.scrollTo({
            top: chatArea.scrollHeight,
            behavior: 'smooth'
        });
    };

    const showTypingIndicator = () => {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
        chatArea.appendChild(indicator);
        chatArea.scrollTo({
            top: chatArea.scrollHeight,
            behavior: 'smooth'
        });
    };

    const removeTypingIndicator = () => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    };

    const generateAIResponse = (userText) => {
        // Remove accents and convert to lowercase for better matching
        const normalizedText = userText.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        let foundResponse = defaultResponse;

        // Simple keyword matching
        for (const item of database) {
            if (item.keywords.some(keyword => normalizedText.includes(keyword))) {
                foundResponse = item.response;
                break;
            }
        }

        return foundResponse;
    };

    // Handle Form Submit
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const text = userInput.value.trim();
        if (!text) return;

        // 1. Add User Message
        addMessage(text, true);
        userInput.value = '';

        // 2. Show Typing Indicator
        showTypingIndicator();

        // 3. Simulate Network/Thinking Delay (1 to 2 seconds)
        const delay = Math.floor(Math.random() * 1000) + 1000;
        
        setTimeout(() => {
            removeTypingIndicator();
            const responseText = generateAIResponse(text);
            addMessage(responseText, false);
            
            // Note: Auto-reading response is disabled by default to avoid startling the user. 
            // They can click the Read Aloud button.
        }, delay);
    });
});
