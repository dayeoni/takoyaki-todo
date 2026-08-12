# 이미지 자리 안내

나중에 타코야끼 그림 파일을 넣으면 여기에 담고, `style.css` 상단 `:root`의
아래 변수만 채우면 지금 CSS로 그린 자리표시자가 실제 그림으로 바뀝니다.

| 변수 | 용도 | 권장 사이즈/형태 |
| --- | --- | --- |
| `--img-widget-bg` | 위젯 전체 박스 배경(접시/포장 이미지) | 위젯 카드 비율(정사각형에 가까운 세로형), PNG |
| `--img-takoyaki` | 체크박스 & 상단 애니메이션에 쓰이는 기본 타코야끼 | 정사각형 PNG, 배경 투명 권장 |
| `--img-takoyaki-done` | 체크(완료) 상태일 때 타코야끼 (소스+마요네즈 얹은 모습) | 정사각형 PNG, 배경 투명 권장 |
| `--img-complete-box` | 하루 할일 다 완료했을 때 뜨는 "타코야끼 완성!" 뱃지 옆 도시락 박스 아이콘 | 정사각형 PNG, 배경 투명 권장 (기본값 `none`, 안 채우면 아무것도 안 보임) |

예시:

```css
:root {
  --img-widget-bg: url("assets/widget-bg.png");
  --img-takoyaki: url("assets/takoyaki.png");
  --img-takoyaki-done: url("assets/takoyaki-done.png");
  --img-complete-box: url("assets/complete-box.png");
}
```

파일 이름은 원하는 대로 바꿔도 되고, 위 변수들의 `url(...)` 경로만 맞춰주면 됩니다.
