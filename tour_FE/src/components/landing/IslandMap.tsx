export default function IslandMap() {
  return (
    <svg viewBox="0 0 640 460" role="img" aria-label="인천 섬 지도 · 인천섬포털 스타일">
        <defs>
          <pattern id="wvp" width="140" height="34" patternUnits="userSpaceOnUse">
            <path d="M0 17 q17.5 -9 35 0 t35 0 t35 0 t35 0" stroke="rgba(255,255,255,.09)" strokeWidth="2" fill="none"/>
          </pattern>
          
          <path id="p-baek" d="M46 52 C50 39 69 33 84 38 C98 33 109 42 106 52 C113 58 104 68 92 70 C79 77 59 74 52 66 C44 62 42 58 46 52 Z"/>
          <path id="p-daech" d="M96 100 C102 91 117 91 125 98 C131 104 124 112 114 113 C103 116 93 108 96 100 Z M130 122 C135 116 147 117 151 122 C149 128 136 130 130 122 Z"/>
          <path id="p-yeonp" d="M198 90 C206 79 225 79 233 88 C237 96 228 105 214 105 C203 105 195 98 198 90 Z M240 112 C244 107 253 108 255 113 C253 118 243 119 240 112 Z"/>
          <path id="p-gangh" d="M470 24 C492 19 513 32 517 52 C525 68 517 87 505 97 C497 111 478 119 466 111 C450 107 440 92 443 76 C436 58 448 33 470 24 Z"/>
          <path id="p-gyo" d="M392 40 C398 31 421 29 429 37 C431 44 420 50 406 50 C396 50 389 46 392 40 Z"/>
          <path id="p-seok" d="M410 72 C420 67 429 76 427 86 C433 94 427 107 416 111 C405 113 399 102 404 92 C400 82 402 76 410 72 Z"/>
          <path id="p-jang" d="M372 154 C384 143 417 139 429 146 C431 152 414 159 396 160 C382 162 369 160 372 154 Z"/>
          <path id="p-sinsi" d="M446 148 C451 143 460 144 462 149 C460 154 449 155 446 148 Z M462 155 C466 151 474 152 476 156 C474 160 465 161 462 155 Z M476 161 C480 157 487 158 489 162 C487 166 479 167 476 161 Z"/>
          <path id="p-yeongj" d="M478 178 C492 167 523 167 535 180 C545 192 543 217 531 229 C516 239 490 239 480 227 C469 214 467 190 478 178 Z"/>
          <path id="p-muui" d="M462 252 C472 245 485 252 485 262 C489 272 479 283 468 281 C457 279 453 268 460 260 Z M486 286 C490 281 498 282 500 287 C498 292 489 293 486 286 Z"/>
          <path id="p-yheung" d="M510 334 C520 325 539 329 543 340 C547 352 534 361 520 359 C509 356 503 344 510 334 Z M544 326 C548 321 556 322 558 327 C556 332 547 333 544 326 Z"/>
          <path id="p-jawol" d="M366 318 C376 309 409 307 417 315 C415 324 396 329 380 329 C369 329 363 324 366 318 Z"/>
          <path id="p-seungb" d="M422 344 C430 337 445 339 447 348 C447 356 434 361 426 357 C419 352 418 348 422 344 Z"/>
          <path id="p-ijak" d="M384 372 C392 365 415 365 419 372 C417 379 400 383 390 381 C383 379 381 376 384 372 Z M362 378 C367 373 377 374 379 379 C377 384 366 385 362 378 Z"/>
          <path id="p-deokj" d="M248 322 C256 307 283 303 297 314 C307 322 305 341 293 349 C280 357 258 355 250 344 C243 338 244 330 248 322 Z"/>
          <path id="p-soya" d="M295 352 C301 345 315 347 317 354 C315 361 302 363 296 358 Z"/>
          <path id="p-mungap" d="M250 370 C255 364 267 365 269 371 C267 377 254 378 250 370 Z"/>
          <path id="p-gureop" d="M196 346 C201 339 214 341 217 346 C215 353 202 355 196 346 Z"/>
        </defs>

        
        <rect x="0" y="0" width="640" height="460" rx="14" fill="#2151CE"/>
        <rect x="0" y="0" width="640" height="460" rx="14" fill="url(#wvp)"/>

        
        <path className="land-main" d="M596 0 L640 0 L640 460 L590 460 Q574 400 588 340 Q602 292 584 250 Q568 208 588 158 Q604 108 586 56 Q576 24 596 0 Z" fill="#C9D6E2" stroke="#9FB2C4" strokeWidth="1.6"/>
        <text x="617" y="140" fontSize="12.5" fontWeight="800" fill="#2D2E6B">인천</text>
        <text x="613" y="330" fontSize="10" fill="#4A5F78">송도</text>
        <circle cx="586" cy="232" r="4.5" fill="#0F5FCC"/>
        <text x="577" y="221" fontSize="10" fill="#2D2E6B" textAnchor="end">인천항</text>

        
        <g stroke="rgba(46,74,116,.45)" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M536 188 L588 170"/><path d="M534 224 L592 298"/>
        </g>

        
        <g className="sea-route" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" fill="none">
          <path d="M580 234 C470 208 250 148 110 64"/>
          <path d="M580 234 C470 196 336 148 238 98"/>
          <path d="M580 236 C498 282 372 320 302 334"/>
          <path d="M580 238 C512 282 452 308 414 320"/>
        </g>

        
        <g className="ferry">
          <g transform="rotate(180)">
            <path d="M14 2 q4 3 8 2" stroke="rgba(255,255,255,.55)" strokeWidth="2" fill="none"/>
            <path d="M-10 -1 L10 -1 Q9 5 2 5 L-6 5 Q-10 5 -10 -1 Z" fill="#fff"/>
            <rect x="-5" y="-6" width="8" height="5" rx="1.4" fill="#fff"/>
            <rect x="-3.4" y="-4.8" width="2.2" height="2.2" rx=".6" fill="#2151CE"/>
          </g>
          <animateMotion dur="30s" repeatCount="indefinite" rotate="auto" path="M580 234 C470 208 250 148 110 64"/>
        </g>
        <g className="ferry">
          <g transform="rotate(180)">
            <path d="M12 1 q4 3 8 2" stroke="rgba(255,255,255,.5)" strokeWidth="1.8" fill="none"/>
            <path d="M-8 -1 L8 -1 Q7 4 1.6 4 L-5 4 Q-8 4 -8 -1 Z" fill="#fff"/>
            <rect x="-4" y="-5" width="6.4" height="4" rx="1.2" fill="#fff"/>
          </g>
          <animateMotion dur="22s" repeatCount="indefinite" rotate="auto" path="M580 236 C498 282 372 320 302 334"/>
        </g>

        
        <g className="isl rg1 done" style={{ ['--d' as string]: '.2s' }}><title>백령도 · 방문 완료</title>
          <use href="#p-baek" className="ext"/><use href="#p-baek" className="land"/>
          <path d="M60 52 l5 -8 l5 8 Z" fill="#4E8C33"/><circle cx="90" cy="50" r="3.4" fill="#3E7C2A"/><rect x="89.3" y="52" width="1.4" height="4" fill="#6B4A2B"/>
          <circle cx="76" cy="60" r="8" fill="#2E9E68" stroke="#fff" strokeWidth="1.6"/><text x="76" y="63.6" fontSize="9.5" fill="#fff" textAnchor="middle" fontWeight="bold">✓</text>
        </g>
        <g className="isl rg1 todo" style={{ ['--d' as string]: '.9s' }}><title>대청도 · 소청도 · 미방문</title>
          <use href="#p-daech" className="ext"/><use href="#p-daech" className="land"/>
        </g>
        <g className="pill"><rect x="58" y="14" width="96" height="21" rx="10.5" fill="#C9256E"/><text x="106" y="28.5" fontSize="10.5" fontWeight="800" fill="#fff" textAnchor="middle">백령·대청도권역</text></g>

        
        <g className="isl rg2 todo" style={{ ['--d' as string]: '.5s' }}><title>연평도 · 미방문</title>
          <use href="#p-yeonp" className="ext"/><use href="#p-yeonp" className="land"/>
        </g>
        <g className="pill"><rect x="180" y="122" width="66" height="21" rx="10.5" fill="#E23B3B"/><text x="213" y="136.5" fontSize="10.5" fontWeight="800" fill="#fff" textAnchor="middle">연평도권역</text></g>

        
        <g className="isl rg3 todo" style={{ ['--d' as string]: '0s' }}><title>강화도 · 미방문</title>
          <use href="#p-gangh" className="ext"/><use href="#p-gangh" className="land"/>
          <path d="M462 60 l7 -12 l7 12 Z" fill="#93A8BB"/><path d="M476 64 l6 -10 l6 10 Z" fill="#879CB0"/>
          <circle cx="500" cy="46" r="3.6" fill="#879CB0"/><rect x="499.3" y="48" width="1.4" height="4.4" fill="#7B8CA0"/>
        </g>
        <g className="isl rg3 todo" style={{ ['--d' as string]: '1.1s' }}><title>교동도 · 미방문</title>
          <use href="#p-gyo" className="ext"/><use href="#p-gyo" className="land"/>
        </g>
        <g className="isl rg3 todo" style={{ ['--d' as string]: '1.9s' }}><title>석모도 · 미방문</title>
          <use href="#p-seok" className="ext"/><use href="#p-seok" className="land"/>
        </g>
        <g className="pill"><rect x="463" y="118" width="66" height="21" rx="10.5" fill="#1F4FB8"/><text x="496" y="132.5" fontSize="10.5" fontWeight="800" fill="#fff" textAnchor="middle">강화도권역</text></g>

        
        <g className="isl rg4 todo" style={{ ['--d' as string]: '.7s' }}><title>장봉도 · 미방문</title>
          <use href="#p-jang" className="ext"/><use href="#p-jang" className="land"/>
        </g>
        <g className="isl rg4 done" style={{ ['--d' as string]: '1.4s' }}><title>신도 · 시도 · 모도 · 방문 완료</title>
          <use href="#p-sinsi" className="ext"/><use href="#p-sinsi" className="land"/>
          <circle cx="455" cy="148" r="6" fill="#2E9E68" stroke="#fff" strokeWidth="1.4"/><text x="455" y="151.4" fontSize="8" fill="#fff" textAnchor="middle" fontWeight="bold">✓</text>
        </g>
        <g className="pill"><rect x="352" y="172" width="56" height="21" rx="10.5" fill="#E07A1F"/><text x="380" y="186.5" fontSize="10.5" fontWeight="800" fill="#fff" textAnchor="middle">북도권역</text></g>

        
        <g className="isl rg5 done" style={{ ['--d' as string]: '.3s' }}><title>영종도 · 방문 완료</title>
          <use href="#p-yeongj" className="ext"/><use href="#p-yeongj" className="land"/>
          <path d="M494 196 l7 -11 l7 11 Z" fill="#4E8C33"/><circle cx="522" cy="192" r="3.4" fill="#3E7C2A"/><rect x="521.3" y="194" width="1.4" height="4" fill="#6B4A2B"/>
          <circle cx="506" cy="212" r="8" fill="#2E9E68" stroke="#fff" strokeWidth="1.6"/><text x="506" y="215.6" fontSize="9.5" fill="#fff" textAnchor="middle" fontWeight="bold">✓</text>
        </g>
        <g className="isl rg5 done" style={{ ['--d' as string]: '1s' }}><title>무의도 · 소무의도 · 방문 완료</title>
          <use href="#p-muui" className="ext"/><use href="#p-muui" className="land"/>
          <circle cx="471" cy="265" r="7" fill="#2E9E68" stroke="#fff" strokeWidth="1.6"/><text x="471" y="268.4" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="bold">✓</text>
        </g>
        <g className="pill"><rect x="446" y="234" width="106" height="21" rx="10.5" fill="#DDDA2E"/><text x="499" y="248.5" fontSize="10.5" fontWeight="800" fill="#4B4708" textAnchor="middle">영종구·서해구권역</text></g>

        
        <g className="isl rg6 todo" style={{ ['--d' as string]: '.4s' }}><title>영흥도 · 선재도 · 미방문</title>
          <use href="#p-yheung" className="ext"/><use href="#p-yheung" className="land"/>
        </g>
        <g className="pill"><rect x="494" y="372" width="66" height="21" rx="10.5" fill="#2F8F3C"/><text x="527" y="386.5" fontSize="10.5" fontWeight="800" fill="#fff" textAnchor="middle">영흥도권역</text></g>

        
        <g className="isl rg7 todo" style={{ ['--d' as string]: '1.3s' }}><title>자월도 · 미방문</title>
          <use href="#p-jawol" className="ext"/><use href="#p-jawol" className="land"/>
        </g>
        <g className="isl rg7 done" style={{ ['--d' as string]: '.8s' }}><title>승봉도 · 방문 완료</title>
          <use href="#p-seungb" className="ext"/><use href="#p-seungb" className="land"/>
          <circle cx="434" cy="349" r="6.5" fill="#2E9E68" stroke="#fff" strokeWidth="1.4"/><text x="434" y="352.6" fontSize="8.5" fill="#fff" textAnchor="middle" fontWeight="bold">✓</text>
        </g>
        <g className="isl rg7 todo" style={{ ['--d' as string]: '1.8s' }}><title>대이작도 · 소이작도 · 미방문</title>
          <use href="#p-ijak" className="ext"/><use href="#p-ijak" className="land"/>
        </g>
        <g className="pill"><rect x="358" y="396" width="66" height="21" rx="10.5" fill="#0F4A55"/><text x="391" y="410.5" fontSize="10.5" fontWeight="800" fill="#fff" textAnchor="middle">자월도권역</text></g>

        
        <g className="isl rg8 done" style={{ ['--d' as string]: '.1s' }}><title>덕적도 · 방문 완료</title>
          <use href="#p-deokj" className="ext"/><use href="#p-deokj" className="land"/>
          <path d="M262 328 l7 -11 l7 11 Z" fill="#4E8C33"/>
          <circle cx="277" cy="336" r="8" fill="#2E9E68" stroke="#fff" strokeWidth="1.6"/><text x="277" y="339.6" fontSize="9.5" fill="#fff" textAnchor="middle" fontWeight="bold">✓</text>
        </g>
        <g className="isl rg8 todo" style={{ ['--d' as string]: '1.5s' }}><title>소야도 · 미방문</title>
          <use href="#p-soya" className="ext"/><use href="#p-soya" className="land"/>
        </g>
        <g className="isl rg8 todo" style={{ ['--d' as string]: '.6s' }}><title>문갑도 · 미방문</title>
          <use href="#p-mungap" className="ext"/><use href="#p-mungap" className="land"/>
        </g>
        <g className="isl rg8 todo" style={{ ['--d' as string]: '1.2s' }}><title>굴업도 · 미방문</title>
          <use href="#p-gureop" className="ext"/><use href="#p-gureop" className="land"/>
        </g>
        <g className="pill"><rect x="192" y="384" width="66" height="21" rx="10.5" fill="#7A3FD8"/><text x="225" y="398.5" fontSize="10.5" fontWeight="800" fill="#fff" textAnchor="middle">덕적도권역</text></g>

        
        <g transform="translate(36,414)">
          <circle r="15" fill="#fff" opacity=".95"/>
          <path d="M0 -9 L3.4 4 L0 1.6 L-3.4 4 Z" fill="#0F5FCC"/>
          <text x="0" y="-19" fontSize="9" fontWeight="800" fill="#fff" textAnchor="middle">N</text>
        </g>
        <text x="622" y="446" fontSize="10" fill="rgba(255,255,255,.75)" textAnchor="end">* 실제 지형을 단순화한 지도입니다</text>
      </svg>
  );
}
