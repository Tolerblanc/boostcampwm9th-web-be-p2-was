- 클래스 다이어그램

```mermaid
classDiagram
    class WasApplication {
        -router: Router
        -globalMiddlewares: MiddlewareFunction[]
        +use(middleware: MiddlewareFunction)
        +registerControllers(controllers: any[])
        +handleRequest(req: Request, res: Response)
        +listen(port: number)
    }

    class Router {
        -root: Node
        +addRoute(method: string, path: string, handlers: RouteHandler[])
        +handle(req: Request, res: Response)
        -runMiddleware(req: Request, res: Response, handlers: MiddlewareFunction[])
        -findNode(node: Node, parts: string[], params: object)
    }

    class Node {
        +children: Map~string, Node~
        +paramChild: Node
        +handlers: Map~string, RouteHandler[]~
        +paramName: string
    }

    class Request {
        +protocol: string
        +method: string
        +path: string
        +query: object
        +headers: object
        +body: object
        +params: object
    }

    class Response {
        -socket: net.Socket
        +status(code: number)
        +send(body: string)
        +json(body: object)
    }

    class Controller {
        <<abstract>>
    }

    WasApplication --> Router
    Router --> Node
    WasApplication --> Request
    WasApplication --> Response
    WasApplication --> Controller

    class Decorators {
        <<interface>>
        +Controller(prefix: string)
        +Get(path: string)
        +Post(path: string)
        +Delete(path: string)
        +Put(path: string)
        +Patch(path: string)
        +Use(middlewares: MiddlewareFunction[])
    }

    Controller ..|> Decorators

    class MiddlewareFunction {
        <<interface>>
    }

    WasApplication --> MiddlewareFunction
    Router --> MiddlewareFunction
```

- 시퀀스 다이어그램 (흐름도)

```mermaid
sequenceDiagram
    participant Client
    participant WasApplication
    participant Router
    participant Controller
    participant Middleware
    participant Handler

    Client->>WasApplication: HTTP Request
    WasApplication->>Router: handleRequest(req, res)
    Router->>Router: findNode(path)
    Router->>Middleware: Global Middleware
    Middleware->>Middleware: Controller-level Middleware
    Middleware->>Middleware: Method-level Middleware
    Middleware->>Handler: Execute Handler
    Handler->>Router: Response
    Router->>WasApplication: Response
    WasApplication->>Client: HTTP Response
```

<details>
  <summary>이전버전</summary>

# 요구 기능 목록 (Week 05)

- 정적 UI

  - [Figma](https://www.figma.com/design/ItRryWWh1blCypoICCPU4p/BE_%EA%B5%90%EC%9C%A1%EC%9A%A9%EC%9B%B9%ED%8E%98%EC%9D%B4%EC%A7%80?node-id=0-1)
  - 메인 게시판
    - 페이지네이션
    - 로그인 시 헤더 변경 / 검색 가능
  - 멤버 리스트
    - 로그인 된 경우만 확인 가능
  - 로그인 페이지
  - 회원가입 페이지
  - 게시글 작성 페이지
  - 게시글 상세(조회) 페이지

- HTTP 요청 파싱

  - **`http`** 모듈을 사용하지 않고, **`net`** 모듈을 사용한다.
  - HTTP GET 요청의 Request Line에서 URI를 추출

- HTTP Request 내용 출력

  - winston을 통해 logging

- 정적 HTML 파일 응답

  - `views` 디렉토리 내부 `index.html` 파일을 읽어 응답
  - `views` 디렉토리 내부 `form.html` 파일을 읽어 응답
  - URI에 해당하는 파일이 없을 경우 404를 리턴
  - html, css, js, ico, png, jpg 컨텐츠 타입에 대한 정적파일 응답

- 회원가입 기능

  - 사용자가 입력한 값을 파싱해 User 객체를 생성하고 저장

- 추가 요구 사항 1

  - 기본 방식 (싱글 스레드 아키텍처)
  - cluster module을 통한 멀티 프로세스 구현
  - worker thread를 통한 멀티 스레드 구현
  - 각 방식별 장단점 분석

- 추가 요구 사항 2

  - 테스트 라이브러리를 통한 단위 테스트 적용
  - jest, mocha 등

# 스펙 정의

- 기본 언어는 `Typescript`를 사용
- 설계 + 구현 -> 확장 으로 진행
  - 최종적으로 [Express](https://expressjs.com/ko/), [Fastify](https://fastify.dev/)와 같이 module 방식 프레임워크를 목표로 한다.
- 테스트 프레임워크는 `jest`를 사용한다.
  - 테스트 주도 개발(TDD)을 적극 활용해본다.

# 구조 설계

- 초기 대략적인 구조

![image](https://github.com/user-attachments/assets/63514d18-78bb-4e0f-b78a-89d1aba3f360)

- 최종 목표로 하는 구조

![image](https://github.com/user-attachments/assets/08e4b639-c293-45b5-bf74-e29f2929a81d)

- Express 흐름 이해해보기

![image](https://github.com/user-attachments/assets/6c8cb2fa-2c55-4763-b396-37e617175da1)

- 1차 설계 개선

![image](https://github.com/user-attachments/assets/c1255910-a2f5-4725-bbcd-5aa824e42aff)

- 2차 설계 개선

![image](https://github.com/user-attachments/assets/960c325b-3391-487b-8465-53411f491f3a)

</details>
