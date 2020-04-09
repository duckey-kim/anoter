# duck-craft

## Introduction

HTML과 CSS의 기본 지식을 쌓은 후 `bootstrap`을 사용하여 4개의 게시판을 가지고 유저들이 게시물을 올리고 댓글을 달 수 있는 웹페이지의 뼈대를 잡고 `nodejs`와 `expressjs`를 활용하여 웹페이지를 hosting할 것이다.

## Prerequisite

- Bootstrap >= 4.4.1
- ExpressJs >= 4.17.1
- NodeJs >= 12.0.0

## Installation

필요한 자원들은 인터넷 또는 npm을 사용하여 다운받을 수 있다.  
NodeJs : 인터넷으로 다운로드[NodeJs](https://nodejs.org/ko/download/)
Bootstrap : 인터넷으로 다운로드 [Bootstrap](https://getbootstrap.com/docs/4.4/getting-started/download/)

```sheel sciprt
npm install bootstrap
```

ExpressJs : NPM을 활용하여 다운로드(NodeJs설치가 된 상태)  
애플리케이션을 보관할 디렉토리를 작성하고 그 디렉토리를 작업 디렉토리로 설정하십시오.

```sheel scirpt
mkdir project
cd project
```

npm init 명령을 이용하여 애플리케이션에 대한 package.json 파일을 작성하십시오

```sheel script
npm init
```

이제 project 디렉토리에 Express를 설치한 후 종속 항목 목록에 저장하십시오.

```sheel script
npm install express --save
```

Express를 임시로 설치하고 종속 항목 목록에 추가하지 않으려면, 다음과 같이 --save 옵션을 생략하십시오.

```sheel sciprt
npm install express
```

## Command

### Test

### Run

```shell script
npm start
```
