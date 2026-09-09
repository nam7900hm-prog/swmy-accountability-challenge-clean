import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const page=fs.readFileSync(path.join(root,"app/page.tsx"),"utf8");
const css=fs.readFileSync(path.join(root,"app/globals.css"),"utf8");
const missions=["palace","castle","ranch","mansion","apartment","cottage","cafe","money"];

test("왼쪽에서 오른쪽으로 밀어내는 기존 채색을 사용하지 않는다",()=>{
 assert.doesNotMatch(page,/mission-reveal|--reveal/);
 assert.doesNotMatch(css,/calc\(100%\s*-\s*var\(--reveal\)\)|clip-path:\s*inset\(0\s+calc/);
});

test("8개 미션은 각각 12개의 의미 영역을 갖는다",()=>{
 for(let i=0;i<missions.length;i++){
  const start=page.indexOf(` ${missions[i]}:[`);
  const end=i===missions.length-1?page.indexOf("\n};",start):page.indexOf(`\n ${missions[i+1]}:[`,start);
  const block=page.slice(start,end<0?page.length:end);
  assert.equal((block.match(/\{name:/g)||[]).length,12,missions[i]);
 }
});

test("하루마다 현재 영역이 20% 선명해지고 5일마다 다음 영역으로 이동한다",()=>{
 assert.match(page,/remainder\*20/);
 assert.match(page,/Math\.floor\(safe\/5\)/);
 assert.match(page,/partState\(total,label\)\/20/);
});

test("색 농도가 아니라 사물 안의 완전한 컬러 면적이 20%씩 늘어난다",()=>{
 assert.match(page,/axis\+wave<=units\/5/);
 assert.match(page,/out\.data\[i\]=painted\?r:sketch/);
 assert.doesNotMatch(page,/sketch\+\(r-sketch\)\*fill/);
});

test("거친 CSS 다각형 대신 사물별 이미지 마스크로 채색한다",()=>{
 const objectRenderer=page.slice(page.indexOf("function ObjectColorArt"),page.indexOf("function Preview"));
 assert.match(objectRenderer,/object-masks\/\$\{mission\}\.png/);
 assert.doesNotMatch(objectRenderer,/clipPath|part\.clip/);
 for(const mission of missions) assert.ok(fs.existsSync(path.join(root,`public/missions/object-masks/${mission}.png`)),mission);
});

test("그림 채색은 보너스가 아닌 필수과제 실천일을 사용한다",()=>{
 assert.match(page,/<Preview s=\{active\} total=\{total\}/);
 assert.match(page,/<Stage s=\{active\} total=\{total\}/);
 assert.doesNotMatch(page,/<Preview s=\{active\} total=\{growth\(active\)\}/);
});

test("기존 학생 기록·보상·관리자·백업 기능을 유지한다",()=>{
 for(const token of ["promise-challenge-v1","5일 실천에 성공했어요","6673","전체 자료 백업하기","백업자료 가져오기","성장기록","미션 그림 소개"]) assert.ok(page.includes(token),token);
});

test("8개 완성 그림 파일을 모두 유지한다",()=>{
 for(const mission of missions) assert.ok(fs.existsSync(path.join(root,`public/missions/${mission}.webp`)),mission);
});

test("기존 전체 학생 목록과 별도 학생 찾기 입력란을 함께 유지한다",()=>{
 assert.match(page,/<div className="student-search">/);
 for(const label of ["기록 찾기 학년","기록 찾기 반","기록 찾기 번호","기록 찾기 이름"]) assert.ok(page.includes(label),label);
 assert.match(page,/<p>등록된 학생<\/p>\{students\.map/);
 assert.match(page,/foundStudents\.map/);
});

test("기타 실천과제 아래에 기본 자동·선택형 수동 채색을 제공한다",()=>{
 assert.match(page,/s\.colorMode\|\|"auto"/);
 assert.ok(page.includes("자동 채색"));
 assert.ok(page.includes("수동 채색"));
 assert.ok(page.includes("color-part-grid"));
 assert.ok(page.includes("selectedColorPart"));
 const extra2=page.indexOf('title="기타 실천과제 2');
 const controls=page.indexOf("<ColorControls",extra2);
 const completion=page.indexOf("오늘의 필수 약속을 모두 지켰어요",extra2);
 assert.ok(extra2>=0&&controls>extra2&&completion>controls,"채색 선택 상자는 기타 실천과제 2 뒤에 있어야 함");
});
