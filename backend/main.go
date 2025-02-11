package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type Todo struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Completed   bool      `json:"completed"`
	Priority    string    `json:"priority"`
	DueDate     string    `json:"dueDate"` // Changed to string for easier JSON handling
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

var todos []Todo

func getTodos(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todos)
}

func createTodo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var todo Todo
	if err := json.NewDecoder(r.Body).Decode(&todo); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Set default values
	todo.ID = uuid.New().String()
	now := time.Now()
	todo.CreatedAt = now
	todo.UpdatedAt = now

	// If no due date is provided, set it to tomorrow
	if todo.DueDate == "" {
		todo.DueDate = now.AddDate(0, 0, 1).Format("2006-01-02")
	}

	if todo.Priority == "" {
		todo.Priority = "medium"
	}

	todos = append(todos, todo)
	json.NewEncoder(w).Encode(todo)
}

func updateTodo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)

	var updatedTodo Todo
	if err := json.NewDecoder(r.Body).Decode(&updatedTodo); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	for index, item := range todos {
		if item.ID == params["id"] {
			updatedTodo.ID = params["id"]
			updatedTodo.CreatedAt = item.CreatedAt
			updatedTodo.UpdatedAt = time.Now()

			// If no due date is provided, keep the existing one
			if updatedTodo.DueDate == "" {
				updatedTodo.DueDate = item.DueDate
			}

			todos[index] = updatedTodo
			json.NewEncoder(w).Encode(updatedTodo)
			return
		}
	}
	w.WriteHeader(http.StatusNotFound)
}

func deleteTodo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)

	for index, item := range todos {
		if item.ID == params["id"] {
			todos = append(todos[:index], todos[index+1:]...)
			break
		}
	}
	json.NewEncoder(w).
		Encode(map[string]string{"message": "Todo deleted successfully"})
}

func toggleTodo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)

	for index, item := range todos {
		if item.ID == params["id"] {
			todos[index].Completed = !item.Completed
			todos[index].UpdatedAt = time.Now()
			json.NewEncoder(w).Encode(todos[index])
			return
		}
	}
	w.WriteHeader(http.StatusNotFound)
}

func main() {
	r := mux.NewRouter()

	// Mock data
	todos = append(todos, Todo{
		ID:          uuid.New().String(),
		Title:       "Learn Go",
		Description: "Complete Go tutorial and build a project",
		Completed:   false,
		Priority:    "high",
		DueDate:     time.Now().AddDate(0, 0, 7).Format("2006-01-02"),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	})

	// Routes
	r.HandleFunc("/todos", getTodos).Methods("GET")
	r.HandleFunc("/todos", createTodo).Methods("POST")
	r.HandleFunc("/todos/{id}", updateTodo).Methods("PUT")
	r.HandleFunc("/todos/{id}", deleteTodo).Methods("DELETE")
	r.HandleFunc("/todos/{id}/toggle", toggleTodo).Methods("PATCH")

	// Enable CORS
	headersOk := handlers.AllowedHeaders(
		[]string{"X-Requested-With", "Content-Type", "Authorization"},
	)
	originsOk := handlers.AllowedOrigins([]string{"http://localhost:3000"})
	methodsOk := handlers.AllowedMethods(
		[]string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
	)

	log.Println("Server starting on port 8080...")
	log.Fatal(
		http.ListenAndServe(
			":8080",
			handlers.CORS(headersOk, originsOk, methodsOk)(r),
		),
	)
}
