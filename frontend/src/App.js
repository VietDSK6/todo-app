import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Edit2, Calendar, CheckCircle, XCircle, Save, X, AlertCircle } from "lucide-react";

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: new Date().toISOString().split('T')[0],
    completed: false
  });
  const [isEditing, setIsEditing] = useState(null);
  const [editingTodo, setEditingTodo] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchTodos();
  }, []);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

  const fetchTodos = async () => {
    const response = await axios.get(`${backendUrl}/todos`);
    setTodos(response.data);
  };

  const addTodo = async (e) => {
    e.preventDefault(); // Prevent form submission
    if (newTodo.title.trim() === "") return;

    try {
      const response = await axios.post(`${backendUrl}/todos`, {
        ...newTodo,
        completed: false
      });
      setTodos([...todos, response.data]);
      setNewTodo({
        title: "",
        description: "",
        priority: "medium",
        dueDate: new Date().toISOString().split('T')[0],
        completed: false
      });
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${backendUrl}/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const response = await axios.patch(`${backendUrl}/todos/${id}/toggle`);
      setTodos(todos.map(todo => todo.id === id ? response.data : todo));
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const updateTodo = async (id) => {
    try {
      const response = await axios.put(`${backendUrl}/todos/${id}`, editingTodo);
      setTodos(todos.map(todo => todo.id === id ? response.data : todo));
      setIsEditing(null);
      setEditingTodo(null);
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const cancelEditing = () => {
    setIsEditing(null);
    setEditingTodo(null);
  };

  const startEditing = (todo) => {
    setIsEditing(todo.id);
    setEditingTodo({
      ...todo,
      dueDate: todo.dueDate
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-2 text-indigo-900">Task Manager</h1>
        <p className="text-center mb-8 text-gray-600">Stay organized, focused, and productive</p>
        
        {/* Add Todo Form */}
        <div className="bg-white rounded-lg shadow-lg mb-8 p-6">
          <form onSubmit={addTodo} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                type="text"
                value={newTodo.title}
                onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                placeholder="Task title"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="text"
                value={newTodo.description}
                onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                placeholder="Description"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <select
                value={newTodo.priority}
                onChange={(e) => setNewTodo({...newTodo, priority: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <input
                type="date"
                value={newTodo.dueDate}
                onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 ease-in-out font-medium"
            >
              Add New Task
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="flex justify-center space-x-4 mb-6">
          {['all', 'active', 'completed'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === filterType
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-indigo-50"
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-4">
          {filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${
                todo.completed ? "opacity-75" : ""
              }`}
            >
              <div className="p-6">
                {isEditing === todo.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <input
                        type="text"
                        value={editingTodo.title}
                        onChange={(e) => setEditingTodo({...editingTodo, title: e.target.value})}
                        className="w-full p-3 border rounded-lg"
                      />
                      <input
                        type="text"
                        value={editingTodo.description}
                        onChange={(e) => setEditingTodo({...editingTodo, description: e.target.value})}
                        className="w-full p-3 border rounded-lg"
                      />
                      <select
                        value={editingTodo.priority}
                        onChange={(e) => setEditingTodo({...editingTodo, priority: e.target.value})}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                      <input
                        type="date"
                        value={editingTodo.dueDate}
                        onChange={(e) => setEditingTodo({...editingTodo, dueDate: e.target.value})}
                        className="w-full p-3 border rounded-lg"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => updateTodo(todo.id)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" /> Save Changes
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        <X className="w-4 h-4 mr-2" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => toggleTodo(todo.id)}
                        className={`p-2 rounded-full transition-colors duration-200 ${
                          todo.completed 
                            ? "bg-green-100 text-green-600 hover:bg-green-200" 
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {todo.completed ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <XCircle className="w-6 h-6" />
                        )}
                      </button>
                      <div>
                        <h3 className={`text-lg font-semibold ${todo.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                          {todo.title}
                        </h3>
                        <p className="text-gray-600 mt-1">{todo.description}</p>
                        <div className="flex items-center space-x-4 mt-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(todo.priority)}`}>
                            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                          </span>
                          <span className="flex items-center text-gray-500 text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(todo.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(todo)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-200"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {filteredTodos.length === 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                <p className="ml-3 text-blue-700">
                  No tasks found. {filter !== 'all' ? `Try changing the filter or adding new tasks.` : 'Start by adding a new task above.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
