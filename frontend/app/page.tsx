"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [message, setMessage] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch questions
  const fetchQuestions = async () => {
    const res = await fetch("http://127.0.0.1:8000/questions");
    const data = await res.json();

    // Escalated first, then by time
    const sorted = data.sort((a: any, b: any) => {
      if (a.status === "Escalated" && b.status !== "Escalated") return -1;
      if (a.status !== "Escalated" && b.status === "Escalated") return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    setQuestions(sorted);
  };

  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 3000);
    return () => clearInterval(interval);
  }, []);

  // Submit question
  const submitQuestion = async () => {
    if (question.trim() === "") {
      setMessage("Question cannot be empty");
      return;
    }

    await fetch("http://127.0.0.1:8000/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question }),
    });

    setQuestion("");
    setMessage("Question submitted");
    fetchQuestions();
  };

  // Admin: mark answered
  const markAnswered = async (id: number) => {
    await fetch(`http://127.0.0.1:8000/questions/${id}/answer`, {
      method: "PUT",
    });
    fetchQuestions();
  };

  // Escalate question
  const escalateQuestion = async (id: number) => {
    await fetch(`http://127.0.0.1:8000/questions/${id}/escalate`, {
      method: "PUT",
    });
    fetchQuestions();
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-gray-200 flex justify-center p-6">
      <div className="w-full max-w-2xl bg-neutral-800 rounded-xl p-6 shadow-lg">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Q&A Dashboard</h1>
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              isAdmin
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isAdmin ? "Logout Admin" : "Login as Admin"}
          </button>
        </div>

        {/* Input */}
        <textarea
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
          className="w-full p-3 rounded bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={submitQuestion}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
        >
          Submit Question
        </button>

        {message && <p className="text-sm text-green-400 mt-2">{message}</p>}

        <hr className="my-6 border-neutral-600" />

        {/* Questions */}
        <h2 className="text-xl font-semibold mb-4">Questions</h2>

        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className={`p-4 rounded-lg ${
                q.status === "Escalated"
                  ? "bg-red-900 border border-red-600"
                  : "bg-neutral-700"
              }`}
            >
              <p className="font-medium text-white">Q: {q.message}</p>

              <div className="text-sm text-gray-300 mt-1">
                <p>
                  Status:{" "}
                  <span className="font-semibold">{q.status}</span>
                </p>
                <p>Time: {q.timestamp}</p>
              </div>

              <div className="flex gap-2 mt-3">
                {q.status !== "Answered" && (
                  <button
                    onClick={() => escalateQuestion(q.id)}
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
                  >
                    Escalate
                  </button>
                )}

                {isAdmin && q.status !== "Answered" && (
                  <button
                    onClick={() => markAnswered(q.id)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                  >
                    Mark as Answered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
