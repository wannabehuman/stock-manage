import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',   // 빌드된 HTML 파일 위치
			assets: 'build',  // JS, CSS, 이미지
			fallback: 'index.html'  // SPA fallback
		  })
	}
};

export default config;