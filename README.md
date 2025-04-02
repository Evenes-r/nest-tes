## Регистрация пользователя

### Response

```bash
curl -X POST http://localhost:3000/auth/register   -H "Content-Type: application/json"   -d '{"username": "user1", "password": "password123"}'
```

### Request

```bash
{"access_token":"jwt токен"}
```

## Аутентификация пользователя

### Response

```bash
curl -X POST http://localhost:3000/auth/login   -H "Content-Type: application/json"   -d '{"username": "user1", "password": "password123"}'
```

### Request

```bash
{"access_token":"jwt токен"}
```

## Создание статьи

### Response

```bash
curl -X POST http://localhost:3000/article \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <Token>" \
  -d '{
    "title": "Статья1",
    "content": "Текст статьи, текст статьи",
    "author": "Автор1"
  }'
```

### Request

```bash
{
  "id": 5,
  "title": "Статья1",
  "content": "Текст статьи, текст статьи",
  "author": "Автор1",
  "createdAt": "2025-04-02T07:26:50.865Z"
}
```

## Получение всех статей

### Response

```bash
 curl -X GET "http://localhost:3000/article"
```

### Request

```bash
{
  "data": [
    {
      "id": 2,
      "title": "Статья2",
      "content": "Текст статьи, текст статьи",
      "author": "Автор2",
      "createdAt": "2025-03-31T07:06:36.447Z"
    }
  ],
  "total": 1,
  "articlesPerPage": 5,
  "currentPage": 1,
  "totalPages": 1
}
```

Data - массив статей<br>
total - всего статей<br>
articlesPerPage - кол статей на страницу<br>
currentPage - страница<br>
totalPages - всего страниц статей<br>

С помощью Query можно управлять пагинацией и фильтрацией<br>

При передаче доп параметра ?page=(номер страницы)<br>
В ответе мы получим статьи для переданной странице<br>

При передаче доп параметра ?order=(ASC | DESC)<br>
В ответе мы получим статьи с сортировкой по дате<br>

При передаче доп параметра ?author=(%D0%90%D0%B2%D1%82%D0%BE%D1%802)<br>
В ответе мы получим статьи с фильтрацией по автору<br>
В запросах для поиска статей с автором используется правильно закодированное значение в URL (например, для автора с кириллическими символами)

## Получение статьи по id

### Response

```bash
curl -X GET http://localhost:3000/article/${id} \
  -H "Authorization: Bearer <Token>"
```

### Request

```bash
{
  "id": 2,
  "title": "Статья2",
  "content": "Текст статьи, текст статьи",
  "author": "Автор2",
  "createdAt": "2025-03-31T07:06:36.447Z"
}
```

## Изменение статьи по id

### Response

```bash
curl -X PUT http://localhost:3000/article/${id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <Token>" \
  -d '{
    "title": "Обновленная статья",
    "content": "Обновленный текст статьи",
    "author": "Новый автор"
  }'
```

### Request

```bash
{
  "id": 2,
  "title": "Обновленная статья",
  "content": "Обновленный текст статьи",
  "author": "Новый автор",
  "createdAt": "2025-03-31T07:06:36.447Z"
}
```

## Удаление статьи

Удаление статьи происходит путем передачи id статьи

Request:

```bash
curl -X DELETE http://localhost:3000/article/${id} \
 -H "Authorization: Bearer <Token>"
```
