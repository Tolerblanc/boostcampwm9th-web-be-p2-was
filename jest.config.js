export default {
  transform: {
    "^.+\\.ts$": "babel-jest", // .ts 파일을 babel-jest로 변환
  },
  testRegex: "(/test/.*|(\\.|/)(test))\\.ts$", // .test.ts 파일에서 테스트 찾기
  moduleFileExtensions: ["ts", "js"], // Jest가 처리할 확장자 목록
};
