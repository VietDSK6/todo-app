FROM golang:1.23.6-alpine3.21

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o todo-backend .

EXPOSE 8080

CMD ["./todo-backend"]