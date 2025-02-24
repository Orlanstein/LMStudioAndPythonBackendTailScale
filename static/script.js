const Chat = () => {
    const [messages, setMessages] = React.useState([]);
    const [inputValue, setInputValue] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const messagesEndRef = React.useRef(null);

    // Scroll to bottom when messages change
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setMessages(prev => [...prev, 
            { role: 'user', content: userMessage },
            { role: 'assistant', content: '', isLoading: true }
        ]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to get response');

            // Simulate typing effect
            const assistantMessage = data.message;
            let displayedText = '';
            for (let i = 0; i < assistantMessage.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 20));
                displayedText += assistantMessage[i];
                setMessages(prev => [
                    ...prev.slice(0, -1),
                    { role: 'assistant', content: displayedText, isLoading: false }
                ]);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: 'Error: ' + error.message, isLoading: false }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
    {/* Contenedor de mensajes con altura fija y desplazamiento */}
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
                }`}>
                    {msg.isLoading ? (
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    ) : (
                        msg.content
                    )}
                </div>
            </div>
        ))}
        <div ref={messagesEndRef} />
    </div>

    {/* Área de entrada de texto */}
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                disabled={isLoading}
            />
            <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className={`px-4 py-2 rounded-lg font-medium ${
                    isLoading || !inputValue.trim()
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors`}
            >
                Send
            </button>
        </div>
    </form>
</div>
    );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<Chat />);

// New chat function
function newChat() {
    fetch('/new-chat', { method: 'POST' })
        .then(() => window.location.reload())
        .catch(err => console.error('Error:', err));
}