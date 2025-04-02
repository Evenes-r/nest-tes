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

Data - массив статей
total - всего статей
articlesPerPage - кол статей на страницу
currentPage - страница
totalPages - всего страниц статей

С помощью Query можно управлять пагинацией и фильтрацией.

При передаче доп параметра ?page=(номер страницы)
В ответе мы получим статьи для переданной странице

При передаче доп параметра ?order=(ASC | DESC)
В ответе мы получим статьи с сортировкой по дате

При передаче доп параметра ?author=(%D0%90%D0%B2%D1%82%D0%BE%D1%802)
В ответе мы получим статьи с фильтрацией по автору
В запросах для поиска статей с автором используется правильно закодированное значение в URL (например, для автора с кириллическими символами).

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
