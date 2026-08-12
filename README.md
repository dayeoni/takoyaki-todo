<p align="center">
  <img src="assets/tako-octopus.png" width="180" alt="타코야끼 마스코트" />
</p>

<h2 align="center">타코야끼를 구워보자.. 지글지글.. 데굴데굴..</h2>

<p align="center">오늘 할 일을 하나씩 구워서, 다 익으면 완성 🐙</p>

---

## 이게 뭐임

노트북 화면 한켠에 띄워두는 미니 투두 위젯. 그날 할 일 넣고, 끝낸 건 체크하면 타코야끼가 완성돼요. 다 구우면(=다 끝내면) 축하 배너 등장.

## 오늘의 재료

- 날짜별 할일 추가 / 수정 / 삭제
- 체크박스 = 타코야끼 (체크하면 꼬치 꽂힌 완성 버전으로 변신)
- 다 완료하면 "오늘의 타코야끼 완성!" 배너 등장
- 위젯 위에서 타코야끼가 데굴데굴 굴러가거나 통통 튀는 애니메이션 (버튼으로 전환)
- 날짜 클릭하면 미니 캘린더로 날짜 점프

## 굽는 법 (실행)

```bash
git clone https://github.com/dayeoni/takoyaki-todo.git
cd takoyaki-todo
open index.html
```

서버 필요 없음, 그냥 열면 끝.

## 진짜 "위젯"처럼 데스크탑에 붙여놓기

브라우저 탭 말고 데스크탑 위에 항상 떠있는 진짜 위젯으로 쓰고 싶다면, [Übersicht](https://tracesof.net/uebersicht/)라는 무료 도구가 필요해요.

```bash
brew install --cask ubersicht
```

1. Übersicht 설치 후 한 번 실행
2. **시스템 설정 → 개인정보 보호 및 보안 → 손쉬운 사용**에서 Übersicht 켜기 (안 켜면 클릭이 안 먹혀요)
3. 이 저장소 폴더에서 로컬 서버 실행 (창 켜둔 채로 유지):
   ```bash
   python3 serve.py
   ```
4. `ubersicht-widget/index.jsx`를 Übersicht 위젯 폴더로 복사:
   ```bash
   mkdir -p ~/"Library/Application Support/Übersicht/widgets/takoyaki-todo"
   cp ubersicht-widget/index.jsx ~/"Library/Application Support/Übersicht/widgets/takoyaki-todo/"
   ```
5. Übersicht 재시작 → 화면에 타코야끼 등장 🎉

위쪽 작은 주황색 손잡이(⠿⠿)를 드래그하면 원하는 자리로 옮길 수 있어요.

> ⚠️ Übersicht는 화면 전체 마우스 클릭을 붙잡는 구조라, macOS 기본 데스크탑 위젯(리마인더 등)이랑 같이 쓰면 그쪽이 안 눌릴 수 있어요. 필요할 때만 켰다 끄는 걸 추천!

## 재료 원산지

폰트는 [교보손글씨 2019](https://noonnu.cc/font_page/419) (웹 임베딩 허용 범위 내 사용)
