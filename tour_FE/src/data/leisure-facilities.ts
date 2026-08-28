/**
 * 관광공사 API 기반 인천 섬 레저 시설 목록 (자동 생성 — 직접 수정하지 마세요)
 *
 * 생성: tour_BE/scripts/tour/export-to-frontend.mjs
 * 출처: 국문 관광정보(contentTypeId=28) · 기초지자체 중심관광지 · 관광지별 연관관광지
 * 총 81곳 (18개 서비스 섬으로 매핑 확정된 시설만)
 */
import type { CategoryKey } from "./sports";

export type LeisureFacility = {
  /** 출처 API의 고유 id */
  id: string;
  name: string;
  category: CategoryKey;
  /** IslandExplorer `ISLANDS[].id` */
  islandId: string;
  islandName: string;
  address: string;
  tel: string | null;
  lat: number | null;
  lng: number | null;
  /** 대표 이미지 (없으면 null — 화면에서 placeholder 처리) */
  photo: string | null;
  /** 어떤 API에서 발견했는지 */
  sources: string[];
  /** 국문관광정보 기반으로 확인된 시설이면 true */
  verified: boolean;
};

export const LEISURE_FACILITIES: LeisureFacility[] = [
  {
    "id": "1028474",
    "name": "[강화 나들길 제2코스] 호국돈대길",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 강화읍 해안동로1366번길 18",
    "tel": null,
    "lat": 37.7336321177,
    "lng": 126.5160613555,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/05/1895205_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "1028544",
    "name": "[강화 나들길 제3코스] 고려왕릉 가는 길",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 강화읍 청하동길 24",
    "tel": null,
    "lat": 37.7458245442,
    "lng": 126.4822613345,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/11/1895211_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "1028565",
    "name": "[강화 나들길 제4코스] 해가 지는 마을 길",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 강화읍 청하동길 24",
    "tel": null,
    "lat": 37.7458245442,
    "lng": 126.4822613345,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/98/3393698_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "1075972",
    "name": "[강화 나들길 제8코스] 철새 보러 가는 길",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 강화읍 청하동길 24",
    "tel": null,
    "lat": 37.7458245442,
    "lng": 126.4822613345,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/27/3393727_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "1074812",
    "name": "강화 자전거 관광코스",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 강화읍",
    "tel": null,
    "lat": 37.7464579051,
    "lng": 126.4880330099,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/96/3350596_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "1eb15f227e3e0c777a89f37393242229",
    "name": "강화경찰수련원",
    "category": "unique",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "",
    "tel": null,
    "lat": 37.624092349352,
    "lng": 126.534550623264,
    "photo": null,
    "sources": [
      "지자체 중심관광지",
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "2733991",
    "name": "강화고인돌캠핑장",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 하점면 강화대로 994-40",
    "tel": null,
    "lat": 37.776228512,
    "lng": 126.4358508522,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/94/2734694_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "1516091",
    "name": "강화도 황청낚시터",
    "category": "water",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 내가면 황청포구로443번길 82",
    "tel": null,
    "lat": 37.7141928345,
    "lng": 126.3647035503,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/76/3042376_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "5136ed5c50dc1afba4f5cc296a28b6dd",
    "name": "강화도자연체험농장",
    "category": "exp",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "",
    "tel": null,
    "lat": null,
    "lng": null,
    "photo": null,
    "sources": [
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "2597317",
    "name": "강화레포츠파크",
    "category": "unique",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 불은면 중앙로 546-34",
    "tel": null,
    "lat": 37.7148582113,
    "lng": 126.4538675793,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/66/2961566_image2_1.jpg",
    "sources": [
      "국문관광정보",
      "지자체 중심관광지",
      "연관 관광지"
    ],
    "verified": true
  },
  {
    "id": "1cb08f34acaa7cbb018cb7da8fbe4d5b",
    "name": "강화루지",
    "category": "exp",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "",
    "tel": null,
    "lat": 37.6168259959393,
    "lng": 126.497949211366,
    "photo": null,
    "sources": [
      "지자체 중심관광지",
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "a0ec80fc79e61284a6034c11c6245f6b",
    "name": "강화바다낚시터",
    "category": "water",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "",
    "tel": null,
    "lat": null,
    "lng": null,
    "photo": null,
    "sources": [
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "2792634",
    "name": "강화카라반해변",
    "category": "water",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 화도면 해안남로 2669",
    "tel": null,
    "lat": 37.6359187923,
    "lng": 126.3740437533,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/90/2799490_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "cbfad777f6f23a8823b843d6d21537e3",
    "name": "강화화개산모노레일",
    "category": "exp",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "",
    "tel": null,
    "lat": 37.7836214191138,
    "lng": 126.290224138038,
    "photo": null,
    "sources": [
      "지자체 중심관광지",
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "1615657",
    "name": "국화지낚시터",
    "category": "water",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 강화읍 국화길 51",
    "tel": null,
    "lat": 37.747374113,
    "lng": 126.4680820355,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/61/1575661_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2847197",
    "name": "글램조이",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 해안서로 689",
    "tel": null,
    "lat": 37.6888351221,
    "lng": 126.3898602814,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/79/2847179_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": false
  },
  {
    "id": "2755854",
    "name": "길상가족낚시터",
    "category": "water",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 길상면 초지로 453",
    "tel": null,
    "lat": 37.6245528757,
    "lng": 126.4996186818,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/23/3588423_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2757130",
    "name": "길정 낚시터",
    "category": "water",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 양도면 고려왕릉로 209",
    "tel": null,
    "lat": 37.6638171566,
    "lng": 126.4661845393,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/41/3566241_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2740108",
    "name": "노을캠핑장",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 양도면 해안서로 695",
    "tel": null,
    "lat": 37.6893628284,
    "lng": 126.3892880966,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/86/2740286_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": false
  },
  {
    "id": "2755743",
    "name": "더숲캠핑장",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 길상면 보리고개로 187-5",
    "tel": null,
    "lat": 37.6275411986,
    "lng": 126.487228066,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/18/2756518_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2758006",
    "name": "렛츠고 강화캠핑",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 화도면 동녘말길 238-13",
    "tel": null,
    "lat": 37.62009344,
    "lng": 126.4072411501,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/70/2758570_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2908217",
    "name": "바다다 캠핑장",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 화도면 내리 2146-2",
    "tel": null,
    "lat": 37.6363855057,
    "lng": 126.379829321,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/05/2908205_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2747245",
    "name": "바다로글램핑",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 화도면 해안남로 2421-228",
    "tel": null,
    "lat": 37.6218232624,
    "lng": 126.3768772162,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/29/2747429_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2740138",
    "name": "바다캠핑장",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 화도면 해안남로 2355-7",
    "tel": null,
    "lat": 37.6133882279,
    "lng": 126.3822130724,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/35/2740335_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2768057",
    "name": "선두바다낚시터",
    "category": "water",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 길상면 해안남로 673-15",
    "tel": null,
    "lat": 37.6000472647,
    "lng": 126.4921061611,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/34/3563634_image2_1.jpg",
    "sources": [
      "국문관광정보",
      "지자체 중심관광지",
      "연관 관광지"
    ],
    "verified": true
  },
  {
    "id": "2013518",
    "name": "선두포저수지",
    "category": "water",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 길상면 보리고개로 13",
    "tel": null,
    "lat": 37.6215055124,
    "lng": 126.4714046821,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/22/3477022_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2908169",
    "name": "스톤캠핑장",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 하점면 고려산로377번길 31",
    "tel": null,
    "lat": 37.7546972188,
    "lng": 126.4089844729,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/47/2908147_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "1615829",
    "name": "신선낚시터",
    "category": "water",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 내가면 고비고개로741번길 37-48",
    "tel": null,
    "lat": 37.719923613,
    "lng": 126.4155126209,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/50/3566750_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2728912",
    "name": "씨사이드힐캠핑장",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 화도면 해안남로 2680-12",
    "tel": null,
    "lat": 37.634752281,
    "lng": 126.3751686824,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/65/2728965_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2740055",
    "name": "아르보리아 캠핑장",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 길상면 장흥로101번길 65",
    "tel": null,
    "lat": 37.6104713201,
    "lng": 126.5074461346,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/64/2740164_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2730787",
    "name": "오크힐글램핑",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 화도면 해안남로1998번길 8-28",
    "tel": null,
    "lat": 37.6042953393,
    "lng": 126.410588504,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/72/2730772_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "1e672d4e864e03808a7792520635d260",
    "name": "유니아일랜드골프앤스파리조트",
    "category": "heal",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "",
    "tel": null,
    "lat": 37.6550598904551,
    "lng": 126.346123005315,
    "photo": null,
    "sources": [
      "지자체 중심관광지",
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "1615967",
    "name": "인산낚시터",
    "category": "water",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 양도면 중앙로787번길 8-1",
    "tel": null,
    "lat": 37.6989596685,
    "lng": 126.4312617608,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/10/3350610_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "f5b20b7edc2af4955771a003c6fa961c",
    "name": "인천광역시교육청난정평화교육원",
    "category": "unique",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "",
    "tel": null,
    "lat": 37.77044706674366,
    "lng": 126.2394832445824,
    "photo": null,
    "sources": [
      "지자체 중심관광지",
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "2734080",
    "name": "쥬라기카라반",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 길상면 해안남로 627-5",
    "tel": null,
    "lat": 37.6003250674,
    "lng": 126.4953669667,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/91/2734791_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2791856",
    "name": "크로바캠핑장",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 길상면 해안남로 497-4",
    "tel": null,
    "lat": 37.5969423739,
    "lng": 126.509351892,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/92/2799392_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2754977",
    "name": "프랭클리 글램핑",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 선원면 시리미로237번길 32",
    "tel": null,
    "lat": 37.728517678,
    "lng": 126.4509535767,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/64/2755264_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2755488",
    "name": "하랑캠핑장",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 내가면 고천리 1259-14번지",
    "tel": null,
    "lat": 37.711388047,
    "lng": 126.3898540998,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/68/2756268_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "131489",
    "name": "함허동천야영장",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 화도면 해안남로1196번길 38",
    "tel": null,
    "lat": 37.6115119045,
    "lng": 126.4527594435,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/81/3535281_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2734083",
    "name": "행복한 소풍캠핑장",
    "category": "land",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 화도면 마니산로 902-15",
    "tel": null,
    "lat": 37.6387967037,
    "lng": 126.4008328859,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/98/2734798_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "131033",
    "name": "황산지(장흥지)",
    "category": "unique",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "인천광역시 강화군 길상면 장흥로 96-1",
    "tel": null,
    "lat": 37.6151208658,
    "lng": 126.5123788879,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/09/3388709_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "f5fd2936ecf9208bc6c8716102f97679",
    "name": "황청낚시터",
    "category": "water",
    "islandId": "gangh",
    "islandName": "강화도",
    "address": "",
    "tel": null,
    "lat": null,
    "lng": null,
    "photo": null,
    "sources": [
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "2753104",
    "name": "교동아일랜드",
    "category": "unique",
    "islandId": "gyo",
    "islandName": "교동도",
    "address": "인천광역시 강화군 교동면 교동남로 275",
    "tel": null,
    "lat": 37.7729098632,
    "lng": 126.300855001,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/68/2753368_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2782235",
    "name": "서포리웰빙삼림욕산책로",
    "category": "heal",
    "islandId": "deokj",
    "islandName": "덕적도",
    "address": "인천광역시 옹진군 덕적면 덕적남로606번길 6",
    "tel": null,
    "lat": 37.2230790346,
    "lng": 126.1171673725,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/52/2786852_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2908228",
    "name": "돌담캠핑가든",
    "category": "land",
    "islandId": "seok",
    "islandName": "석모도",
    "address": "인천광역시 강화군 삼산북로 397-1",
    "tel": null,
    "lat": 37.7012575941,
    "lng": 126.3282433636,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/18/2908218_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2758228",
    "name": "민머루잼머",
    "category": "unique",
    "islandId": "seok",
    "islandName": "석모도",
    "address": "인천광역시 강화군 삼산면 어류정길198번길 6",
    "tel": null,
    "lat": 37.653741057,
    "lng": 126.3364439275,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/95/2948595_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": false
  },
  {
    "id": "d7e358e84284921cb594b68bf618698e",
    "name": "석모도미네랄스파",
    "category": "heal",
    "islandId": "seok",
    "islandName": "석모도",
    "address": "",
    "tel": null,
    "lat": 37.685614772500486,
    "lng": 126.31188401213183,
    "photo": null,
    "sources": [
      "지자체 중심관광지",
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "2743847",
    "name": "원스캠핑장",
    "category": "land",
    "islandId": "seok",
    "islandName": "석모도",
    "address": "인천광역시 강화군 삼산면 삼산남로604번길 37",
    "tel": null,
    "lat": 37.6769411696,
    "lng": 126.3387291872,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/93/2744393_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2768065",
    "name": "항포낚시터",
    "category": "water",
    "islandId": "seok",
    "islandName": "석모도",
    "address": "인천광역시 강화군 삼산면 삼산서로310번길 21",
    "tel": null,
    "lat": 37.7060813071,
    "lng": 126.2868053649,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/74/3395374_image2_1.jpg",
    "sources": [
      "국문관광정보",
      "지자체 중심관광지",
      "연관 관광지"
    ],
    "verified": true
  },
  {
    "id": "2755691",
    "name": "헬로 카라반",
    "category": "land",
    "islandId": "seok",
    "islandName": "석모도",
    "address": "인천광역시 강화군 삼산면 어류정길198번길 8",
    "tel": null,
    "lat": 37.6533522146,
    "lng": 126.3365133764,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/51/2756451_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": false
  },
  {
    "id": "2710985",
    "name": "연평평화안보수련원",
    "category": "unique",
    "islandId": "yeonp",
    "islandName": "연평도",
    "address": "인천광역시 옹진군 연평면 연평중앙로24번길 25",
    "tel": null,
    "lat": 37.6654510122,
    "lng": 125.7040350309,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/50/2710950_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": false
  },
  {
    "id": "2733992",
    "name": "락인뜰",
    "category": "unique",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "인천광역시 영종구 늘목로 38 (을왕동)",
    "tel": null,
    "lat": 37.4542097734,
    "lng": 126.3958189907,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/65/2734265_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "952a98d2a8955a6f09bd0d45f810ca9a",
    "name": "만정바다낚시터",
    "category": "water",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": null,
    "lng": null,
    "photo": null,
    "sources": [
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "2768151",
    "name": "만정바다좌대낚시터",
    "category": "water",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "인천광역시 영종구 영종순환로 279-20 (중산동)",
    "tel": null,
    "lat": 37.5158969367,
    "lng": 126.5483200237,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/25/2790225_image2_1.jpg",
    "sources": [
      "국문관광정보",
      "지자체 중심관광지",
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "2768158",
    "name": "만정사계절바다낚시터",
    "category": "water",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "인천광역시 영종구 영종순환로 279-20 (중산동)",
    "tel": null,
    "lat": 37.5150026654,
    "lng": 126.5522724652,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/48/3565648_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": false
  },
  {
    "id": "48316cd2819d17d5a464e3eb5fdc5b88",
    "name": "베르힐컨트리클럽/영종",
    "category": "unique",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": 37.52581334756877,
    "lng": 126.56279424562064,
    "photo": null,
    "sources": [
      "지자체 중심관광지"
    ],
    "verified": false
  },
  {
    "id": "675c60f451bdd0140886221781a909ce",
    "name": "삼성호낚시슈퍼",
    "category": "water",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": null,
    "lng": null,
    "photo": null,
    "sources": [
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "2744549",
    "name": "서해캠핑장",
    "category": "land",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "인천광역시 영종구 용유서로423번길 41 (을왕동)",
    "tel": null,
    "lat": 37.4576977742,
    "lng": 126.3681519792,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/65/2744865_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "61cc7feaa89c5b97b077e74dbb0f961a",
    "name": "씨사이드파크해수족욕장",
    "category": "unique",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": 37.47045437406631,
    "lng": 126.51950895416206,
    "photo": null,
    "sources": [
      "지자체 중심관광지"
    ],
    "verified": false
  },
  {
    "id": "2e5f670b16be8f604ed3fd69eb886ef2",
    "name": "영종구평생학습관",
    "category": "exp",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": null,
    "lng": null,
    "photo": null,
    "sources": [
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "a820025a35df9b48118470edc219f622",
    "name": "영종씨사이드레일바이크",
    "category": "exp",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": 37.4883583174538,
    "lng": 126.57660361673,
    "photo": null,
    "sources": [
      "지자체 중심관광지",
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "4f1a8e07596db2c9e46f1ba8e00980a8",
    "name": "오렌지듄스영종골프클럽",
    "category": "unique",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": 37.434283,
    "lng": 126.4552032,
    "photo": null,
    "sources": [
      "지자체 중심관광지"
    ],
    "verified": false
  },
  {
    "id": "2731145",
    "name": "왕산가족오토캠핑장",
    "category": "land",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "인천광역시 영종구 용유서로423번길 60 (을왕동)",
    "tel": null,
    "lat": 37.4582032371,
    "lng": 126.3662160311,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/00/2731500_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "5e712ece3128d613157c0a99e219f92e",
    "name": "인천광역시교육청교직원수련원",
    "category": "unique",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": 37.450278229205,
    "lng": 126.373955648,
    "photo": null,
    "sources": [
      "지자체 중심관광지"
    ],
    "verified": false
  },
  {
    "id": "d1d66c921b64bde22bff57ccc4b82518",
    "name": "천혜바다낚시터",
    "category": "water",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": 37.508744790179,
    "lng": 126.56690986312,
    "photo": null,
    "sources": [
      "지자체 중심관광지"
    ],
    "verified": false
  },
  {
    "id": "f5dd2fca738179175e39ef0d3de49032",
    "name": "천혜사랑바다낚시터",
    "category": "water",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": null,
    "lng": null,
    "photo": null,
    "sources": [
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "f6c9979a8f880e865656bdac19e19544",
    "name": "클럽72CC/레이크코스",
    "category": "unique",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": 37.47477599185,
    "lng": 126.479029243505,
    "photo": null,
    "sources": [
      "지자체 중심관광지",
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "04bdb27729c4b7841aabe7665b964ad2",
    "name": "클럽72CC/바다코스",
    "category": "unique",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": 37.483441596862,
    "lng": 126.468835644143,
    "photo": null,
    "sources": [
      "지자체 중심관광지",
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "42fd1174288dd242e7b853a2317ff01a",
    "name": "클럽72CC/오션코스",
    "category": "unique",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": 37.48991303909735,
    "lng": 126.46347496024373,
    "photo": null,
    "sources": [
      "지자체 중심관광지"
    ],
    "verified": false
  },
  {
    "id": "f8c8c69118aa4e589af66ac9f98e8434",
    "name": "클럽72CC/클래식코스",
    "category": "unique",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": 37.47752563784576,
    "lng": 126.47280755999705,
    "photo": null,
    "sources": [
      "지자체 중심관광지",
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "3963b252b8609f35383805076af8a634",
    "name": "클럽72CC/하늘코스",
    "category": "unique",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": 37.4470570002769,
    "lng": 126.482973581004,
    "photo": null,
    "sources": [
      "지자체 중심관광지"
    ],
    "verified": false
  },
  {
    "id": "7ca706eda3e5a6f2c6b063aef77a7cc1",
    "name": "파라다이스시티/씨메르",
    "category": "heal",
    "islandId": "yeongj",
    "islandName": "영종도",
    "address": "",
    "tel": null,
    "lat": 37.435669279858,
    "lng": 126.456892711471,
    "photo": null,
    "sources": [
      "지자체 중심관광지",
      "연관 관광지"
    ],
    "verified": false
  },
  {
    "id": "2734162",
    "name": "농어바위캠핑장",
    "category": "land",
    "islandId": "yheung",
    "islandName": "영흥도",
    "address": "인천광역시 옹진군 영흥면 영흥서로 420-19",
    "tel": null,
    "lat": 37.2818503398,
    "lng": 126.4587846299,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/14/2735714_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2755756",
    "name": "명성가족캠핑촌",
    "category": "land",
    "islandId": "yheung",
    "islandName": "영흥도",
    "address": "인천광역시 옹진군 영흥면 영흥로722번길 43",
    "tel": null,
    "lat": 37.273095758,
    "lng": 126.4563739778,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/29/2756529_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2792621",
    "name": "모모카라반",
    "category": "land",
    "islandId": "yheung",
    "islandName": "영흥도",
    "address": "인천광역시 옹진군 영흥면 영흥로757번길 176",
    "tel": null,
    "lat": 37.2670602097,
    "lng": 126.4484748618,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/30/2799530_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2734307",
    "name": "블랙트리캠핑",
    "category": "land",
    "islandId": "yheung",
    "islandName": "영흥도",
    "address": "인천광역시 옹진군 영흥면 영흥로757번길 234-13",
    "tel": null,
    "lat": 37.2642771882,
    "lng": 126.4478444395,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/77/2735977_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2734755",
    "name": "솔바다캠핑장",
    "category": "land",
    "islandId": "yheung",
    "islandName": "영흥도",
    "address": "인천광역시 옹진군 영흥면 영흥서로 527-14",
    "tel": null,
    "lat": 37.2746816309,
    "lng": 126.453276994,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/89/2735989_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2908042",
    "name": "영흥도어울림캠핑장",
    "category": "land",
    "islandId": "yheung",
    "islandName": "영흥도",
    "address": "인천광역시 옹진군 영흥면 영흥서로 452-67",
    "tel": null,
    "lat": 37.2827640609,
    "lng": 126.4552293736,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/19/2908019_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2767615",
    "name": "영흥바다낚시터",
    "category": "water",
    "islandId": "yheung",
    "islandName": "영흥도",
    "address": "인천광역시 옹진군 영흥면 영흥로176번길 21",
    "tel": null,
    "lat": 37.2608061423,
    "lng": 126.492234935,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/12/2780912_image2_1.jpg",
    "sources": [
      "국문관광정보",
      "지자체 중심관광지"
    ],
    "verified": true
  },
  {
    "id": "2767616",
    "name": "용담바다낚시터",
    "category": "water",
    "islandId": "yheung",
    "islandName": "영흥도",
    "address": "인천광역시 옹진군 영흥면 외리 21",
    "tel": null,
    "lat": 37.2415525238,
    "lng": 126.475237008,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/86/2790486_image2_1.jpg",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  },
  {
    "id": "2741533",
    "name": "장경리해변야영장",
    "category": "water",
    "islandId": "yheung",
    "islandName": "영흥도",
    "address": "인천광역시 옹진군 영흥면 영흥로757번길 6",
    "tel": null,
    "lat": 37.2727206897,
    "lng": 126.4499606833,
    "photo": "http://tong.visitkorea.or.kr/cms/resource/89/2741689_image2_1.JPG",
    "sources": [
      "국문관광정보"
    ],
    "verified": true
  }
];

/** 카테고리별 시설 목록 */
export const FACILITIES_BY_CATEGORY: Record<CategoryKey, LeisureFacility[]> =
  LEISURE_FACILITIES.reduce(
    (acc, f) => {
      acc[f.category].push(f);
      return acc;
    },
    { water: [], land: [], exp: [], heal: [], unique: [] } as Record<
      CategoryKey,
      LeisureFacility[]
    >,
  );

/** 특정 섬의 시설 목록 */
export function getFacilitiesByIsland(islandId: string): LeisureFacility[] {
  return LEISURE_FACILITIES.filter((f) => f.islandId === islandId);
}
