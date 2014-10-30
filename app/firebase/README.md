
# Firebase 설정하기

firebase.io를 이용해 간단히 3단계만에 데이터를 저장하세요!

1. HTML에 태그 삽입하기
2. AngularJS에 module dependency 추가하기
3. 코드 수정하기
4. 더 많은 기능..

## 1. 태그 삽입하기

다음의 코드를 추가하면 됩니다.

* firebase.js 파일
* angularjfire.js (공식 AngularJS 라이브러리)
* fireboard.js 파일 (프로젝트용 라이브러리)

`index.html`을 열고 다음 세 줄을 추가해주세요:

```
	<!-- firebase -->
    <script src="../firebase/firebase.1.1.2.js"></script>
    <script src="../firebase/angularfire.0.8.2.min.js"></script>
    <script src="../firebase/fireboard.js"></script>
```

`fireboard.js` 라이브러리를 쓰면 더 편하게 사용할 수 있습니다.


## 2. AngularJS에 module dependency 추가하기

1. 기존 AngularJS app 모듈을 다음처럼 바꿉니다:

        var app = angular.module('jh2', ['fireboard']);


2. controller 모듈도 바꿔줍니다 (배열로 들어갔다는 걸 유의하세요):

        app.controller('MainController', ['$scope', 'FireBoardFactory', function($scope, FireBoard) {

            var board = new FireBoard('jh2');

            // ...

        }]);

`FireBoard`에 자기 팀이름을 넣으면 됩니다.

아무 문제 없이 화면이 뜨는지 확인해봅니다.


## 3. 실제 코드 변경하기

이제 기존의 코드를 어떻게 바꾸면 되는지 보여드릴게요.

1. 불러오기 (List)

    Before:

            $scope.articles = [{
                id: 1,
                content: '우헤엥'
            }, {
                id: 2,
                content: '나 지워봐라'
            }];


    After:

            $scope.articles = board.getList();


2. 새로 생성하기 (Create)

    Before:

            var article = {
                id: new Date(),
                title  : $scope.newArticle.title,
                content: $scope.newArticle.content,
            };

            $scope.articles.push();

    After:

            board.add(article);


    `$scope.articles`에는 자동으로 추가되기 때문에 따로 해줄 필요가 없다는거!


3. 수정하기 (Update)


    Before:

            article.title   = $scope.newArticle.title;
            article.content = $scope.newArticle.content;

    After:

            article.title   = $scope.newArticle.title;
            article.content = $scope.newArticle.content;
            //
            board.save(article);


    firebase 내부적으로 `$id`를 들고 있어서 정확히 어떤 article을 수정할지 알아냅니다. (편함)

    sync를 해줘야 하기 때문에 `board.save()`를 불러주어야 합니다.


4. 삭제 (Delete)

    Before:

            $scope.articles = $scope.articles.splice(index, 1);

    After:

            board.remove(article);


    `$scope.articles`는 자동으로 삭제가되기 때문에 따로 해줄 필요가 없어요 :)


## 4. 기타 더 많은 기능

* https://dailyjs.firebaseio.com/ 에 들어가서 실제 데이터가 어떻게 들어가는지 볼 수 있습니다. (가입하고 승주님한테 권한 달라고 하세요)


* 실제 firebase에 저장되는 article이란 객체는 이렇게 생겼습니다:

        var article = {
          id              : "(선택) id를 넣어도 됩니다. 안 넣어도 됩니다.",
          title           : "(선택) 본문 제목"
          content         : "(필수) 본문 내용",
          
          created_at      : "(선택) 생성 시각. 없으면 FireBoard가 알아서 맞춰줍니다.",
          last_modified_at: "(선택) 최종 수정 시각. 없으면 FireBoard가 알아서 맞춰줍니다."
        }

    이 중 `content` 필드만 필수입니다.


* `FireBoard`에 인자로 `"all"`을 넣으면, 다른 모든 팀들의 데이터가 한꺼번에 보입니다! (짱짱)

* 노티를 받을 수 있는 `onAdd`, `onChange`, `onRemove`도 있습니다.

        board.onAdd(function(article, prevArticle) {
            console.log('누가 추가했어요:', article.content);
        }, this);

        board.onRemove(function(article) {
            console.log('님은 갔습니다:', article.content);
        }, this);

        board.onChange(function(article) {
            console.log('전 변했습니다:', article.content);
        }, this);

*   Firebase 생각보다 어렵지 않더군요. [5 minute tutorial](https://www.firebase.com/tutorial/#gettingstarted)로 해보면 금방 감 잡습니다.

    더 자세한 정보는 [firebase 레퍼런스](https://www.firebase.com/docs/web/api/firebase/)나 [angularfire 문서](https://www.firebase.com/docs/web/libraries/angular/api.html)를 참고하세요.
  
  
