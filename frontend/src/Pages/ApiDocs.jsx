import React from "react";
import { Link } from "react-router-dom";
import api from "../api";


const ApiDocs = () => {
  return (
    <div className="max-w-4xl mt-200 p-6 bg-white shadow-lg rounded-2xl">
      <div className="flex justify-between items-center mb-4"> 
        <h1 className="text-3xl font-bold">📘 Study Plan Generator API</h1>
        <a className="text-blue-500 hover:underline" href="https://team76.bham.team/">
          Return to Home
        </a>
      </div>

      
      <section className="mb-6">
        <h2 className="text-xl font-semibold">📍 Endpoint</h2>
        <p className="font-mono bg-gray-100 p-2 rounded mt-2">POST https://team76.bham.team/api/study-plan/</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">📝 Description</h2>
        <p className="mt-2 text-gray-700">
          This endpoint allows users to generate a personalized and structured study plan based on their academic goals or study requirements.
          The system uses advanced study techniques such as <strong>Pomodoro</strong>, <strong>Spaced Repetition</strong>, and the <strong>Feynman Technique</strong>,
          powered by an LLM to create effective and actionable plans.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">📥 Request Body</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`{
  "prompt": "I want to study for my computer science finals in 2 weeks"
}`}
        </pre>
        <table className="w-full text-left mt-4 border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Field</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Required</th>
              <th className="p-2 border">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border font-mono">prompt</td>
              <td className="p-2 border">string</td>
              <td className="p-2 border">Yes</td>
              <td className="p-2 border">A detailed description of your study goals or topics you want to focus on.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">📤 Response</h2>

        <p className="mt-2 font-semibold">✅ Success (200):</p>
        <pre className="bg-green-50 p-4 rounded text-sm overflow-x-auto">
{`{
  "message": "Study plan generated successfully",
  "data": "<Generated study plan text>"
}`}
        </pre>

        <p className="mt-4 font-semibold">❌ Client Error (400):</p>
        <pre className="bg-yellow-50 p-4 rounded text-sm overflow-x-auto">
{`{
  "error": "Missing prompt"
}`}
        </pre>

        <p className="mt-4 font-semibold">❌ Server Error (500):</p>
        <pre className="bg-red-50 p-4 rounded text-sm overflow-x-auto">
{`{
  "error": "Error message from the backend"
}`}
        </pre>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">✨ Features</h2>
        <ul className="list-disc ml-6 text-gray-700 mt-2">
          <li>Automatically creates a structured study plan using proven techniques.</li>
          <li>Handles user-defined prompts and study goals intelligently.</li>
          <li>Returns well-formatted, readable plans for immediate use.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">💡 Example Use Case</h2>
        <p className="mt-2 text-gray-700">
          Students preparing for exams or learning new skills can use this API to break down their workload into manageable sessions using efficient time management strategies.
        </p>
      </section>
    </div>
  );
};

export default ApiDocs;
