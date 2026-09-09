import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ReviewTagSummary } from '../src/components/community/ReviewTagSummary';
import { ReviewTagPicker } from '../src/components/community/ReviewTags';
import { PostRow } from '../src/components/community/PostRow';
import { filterPosts } from '../src/lib/posts';
import type { Post } from '../src/types/community';
import type { ReviewTagId } from '../src/constants/review-tags';
import '../src/index.css';
import '../src/styles/community.css';

const examples: {title:string; tags:ReviewTagId[]}[] = [
  {title:'해변에서 본 일몰이 오래 기억에 남아요', tags:['beautiful_sunset','relaxing','quiet']},
  {title:'가족과 다녀온 자월도, 차가 있어 편했어요', tags:['family_friendly','car_recommended','beautiful_sunset']},
  {title:'조용히 쉬기 좋았던 주말 여행', tags:['quiet','relaxing','beautiful_sunset']},
  {title:'섬을 둘러보려면 이동 계획을 세워보세요', tags:['car_recommended','limited_amenities','weather_dependent']},
  {title:'아이와 바닷가를 걸으며 보낸 하루', tags:['family_friendly','relaxing','good_for_walking']},
];
const posts:Post[] = examples.map((item,index)=>({...item,id:`preview-${index}`,type:'review',island:'자월도',activity:'해안 산책',content:item.title,author:{id:'preview',nickname:`여행자 ${index+1}`,bti:'파도형'},createdAt:'2026-09-09',views:12,likes:0,comments:[]}));
function Preview(){
  const [selectedTags,setSelectedTags]=useState<ReviewTagId[]>([]);
  const [tags,setTags]=useState<ReviewTagId[]>(['beautiful_sunset','quiet','car_recommended']);
  const filtered=filterPosts(posts,{category:'review',islands:new Set(['자월도']),activities:new Set(),query:'',tags:selectedTags});
  return <main style={{maxWidth:1040,margin:'0 auto',padding:'28px 20px 60px'}}>
    <p className="cm-review-note">기능 미리보기 · 예시 데이터 · 실제 후기나 DB에 저장되지 않습니다.</p>
    <h1 style={{fontSize:24,color:'var(--cm-navy)',margin:'8px 0 20px'}}>섬 특징 해시태그로 후기 탐색</h1>
    <ReviewTagSummary posts={posts} island="자월도" selected={selectedTags} status="ready" onSelect={setSelectedTags}/>
    <p className="cm-review-note" role="status">후기 {filtered.length}개 · 위 특징을 눌러 필터를 확인해보세요.</p>
    <div className="cm-post-list" onClickCapture={event=>event.stopPropagation()}>
      {!filtered.length && <p className="cm-post-list-empty">선택한 특징을 모두 포함한 후기가 없습니다. 특징 필터를 해제해보세요.</p>}
      {filtered.map(post=><PostRow key={post.id} post={post} columns="community"/>)}
    </div>
    <section className="cm-review-summary" style={{marginTop:24}}>
      <h2 style={{marginBottom:18}}>후기 작성 시 태그 선택</h2>
      <ReviewTagPicker value={tags} onChange={setTags}/>
    </section>
  </main>;
}
createRoot(document.getElementById('root')!).render(<BrowserRouter><Preview/></BrowserRouter>);
