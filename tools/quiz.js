const QUESTIONS = [
    {
        id: "flavor",
        question: "What flavor profile do you prefer?",
        options: [
            { text: "Bright & Fruity", value: "light" },
            { text: "Balanced & Smooth", value: "medium" },
            { text: "Bold & Rich", value: "dark" },
        ],
    },
    {
        id: "body",
        question: "How do you like your coffee's body?",
        options: [
            { text: "Light & Tea-like", value: "light" },
            { text: "Medium & Syrupy", value: "medium" },
            { text: "Heavy & Creamy", value: "dark" },
        ],
    },
    {
        id: "acidity",
        question: "What's your preference for acidity?",
        options: [
            { text: "High - Bright & Tangy", value: "light" },
            { text: "Medium - Balanced", value: "medium" },
            { text: "Low - Smooth", value: "dark" },
        ],
    },
    {
        id: "time",
        question: "When do you usually drink coffee?",
        options: [
            { text: "Morning - Need energy", value: "light" },
            { text: "Afternoon - Stay focused", value: "medium" },
            { text: "After meals - Relaxing", value: "dark" },
        ],
    },
];

const ROAST_RESULTS = {
    light: {
        name: "Light Roast",
        description: "Bright, complex, and aromatic with pronounced origin characteristics. Perfect for those who appreciate nuanced flavors and high acidity.",
        characteristics: [
            "Fruity & Floral notes",
            "High caffeine content",
            "Light brown color",
            "Pronounced acidity",
        ],
        brewMethods: ["Pour Over", "Aeropress", "Cold Brew"],
    },
    medium: {
        name: "Medium Roast",
        description: "The perfect balance between origin flavors and roast character. Versatile and approachable for most coffee drinkers.",
        characteristics: [
            "Balanced flavor profile",
            "Moderate acidity",
            "Medium brown color",
            "Caramel sweetness",
        ],
        brewMethods: ["Drip Coffee", "French Press", "Moka Pot"],
    },
    dark: {
        name: "Dark Roast",
        description: "Bold, full-bodied with rich chocolate and caramel notes. Lower acidity makes it smooth and easy on the stomach.",
        characteristics: [
            "Bold & Smoky notes",
            "Low acidity",
            "Dark brown to black",
            "Full body",
        ],
        brewMethods: ["Espresso", "French Press", "South Indian Filter"],
    },
};

let currentQuestion = 0;
let answers = {};

function showQuestion() {
    const question = QUESTIONS[currentQuestion];
    document.getElementById('currentQuestion').textContent = currentQuestion + 1;
    document.getElementById('totalQuestions').textContent = QUESTIONS.length;
    document.getElementById('questionText').textContent = question.question;
    
    const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressPercent').textContent = Math.round(progress) + '%';
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.innerHTML = `<span>${option.text}</span><span>→</span>`;
        button.onclick = () => handleAnswer(option.value);
        optionsContainer.appendChild(button);
    });
    
    document.getElementById('backButton').classList.toggle('hidden', currentQuestion === 0);
}

function handleAnswer(value) {
    answers[QUESTIONS[currentQuestion].id] = value;
    
    if (currentQuestion < QUESTIONS.length - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        showResult();
    }
}

function goBack() {
    if (currentQuestion > 0) {
        currentQuestion--;
        delete answers[QUESTIONS[currentQuestion].id];
        showQuestion();
    }
}

function calculateResult() {
    const counts = { light: 0, medium: 0, dark: 0 };
    Object.values(answers).forEach(answer => {
        counts[answer]++;
    });
    
    const winner = Object.entries(counts).reduce((a, b) => b[1] > a[1] ? b : a)[0];
    return ROAST_RESULTS[winner];
}

function showResult() {
    document.getElementById('questionScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
    
    const result = calculateResult();
    document.getElementById('resultName').textContent = result.name;
    document.getElementById('resultDescription').textContent = result.description;
    
    const characteristics = document.getElementById('characteristics');
    characteristics.innerHTML = '';
    result.characteristics.forEach(char => {
        const div = document.createElement('div');
        div.className = 'characteristic';
        div.textContent = char;
        characteristics.appendChild(div);
    });
    
    const brewMethods = document.getElementById('brewMethods');
    brewMethods.innerHTML = '';
    result.brewMethods.forEach(method => {
        const span = document.createElement('span');
        span.className = 'brew-method';
        span.textContent = method;
        brewMethods.appendChild(span);
    });
}

function resetQuiz() {
    currentQuestion = 0;
    answers = {};
    document.getElementById('questionScreen').classList.remove('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
    showQuestion();
}

// Initialize
showQuestion();

