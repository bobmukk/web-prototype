const $=id=>document.getElementById(id);
const fileInput=$('fileInput'), dropArea=$('dropArea');
let selectedFile=null, activeTab='original', demoReady=false;
function toast(msg){const t=$('toast');t.textContent=msg;t.style.display='block';clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.style.display='none',2800)}
function selectFile(file){
 if(!file)return;
 const allowed=['image/jpeg','image/png','image/tiff','image/bmp'];
 if(!allowed.includes(file.type)){toast('JPG, PNG, TIFF, BMP 형식의 이미지 파일을 선택해 주세요.');return}
 selectedFile=file;$('fileName').textContent=file.name;$('fileMeta').textContent=`${(file.size/1024/1024).toFixed(2)} MB · 업로드 완료(시안)`;$('ocrBtn').disabled=false;
 dropArea.style.display='none';$('docPreview').style.display='flex';toast('파일이 선택되었습니다. OCR 실행을 눌러보세요.');
}
$('chooseBtn').onclick=()=>fileInput.click();$('chooseBtn2').onclick=()=>fileInput.click();fileInput.onchange=e=>selectFile(e.target.files[0]);
['dragenter','dragover'].forEach(ev=>dropArea.addEventListener(ev,e=>{e.preventDefault();dropArea.classList.add('drag')}));
['dragleave','drop'].forEach(ev=>dropArea.addEventListener(ev,e=>{e.preventDefault();dropArea.classList.remove('drag')}));
dropArea.addEventListener('drop',e=>selectFile(e.dataTransfer.files[0]));

let ocrRunning = false;

const demoStages = [
  {
    title: '이미지 분석 중',
    message: '문서 이미지의 크기와 구성을 확인하고 있습니다.',
    percent: 30
  },
  {
    title: '문자 영역 탐지 중',
    message: '문자가 포함된 영역을 분석하는 단계를 시연합니다.',
    percent: 65
  },
  {
    title: '텍스트 변환 중',
    message: '인식된 문자를 원문 텍스트로 변환하는 단계를 시연합니다.',
    percent: 90
  }
];

function updateOCRStage(index) {
  const stage = demoStages[index];

  $('processingTitle').textContent = stage.title;
  $('processingMessage').textContent = stage.message;
  $('processingPercent').textContent = stage.percent + '%';
  $('progressFill').style.width = stage.percent + '%';

  demoStages.forEach((item, i) => {
    const step = $('ocrStep' + (i + 1));
    const detail = step.querySelector('.step-detail');

    step.classList.remove('active', 'done');

    if (i < index) {
      step.classList.add('done');
      step.querySelector('.step-status').textContent = '✓';
      detail.textContent = '완료';
    } else if (i === index) {
      step.classList.add('active');
      step.querySelector('.step-status').textContent = '…';
      detail.textContent = '진행 중';
    } else {
      step.querySelector('.step-status').textContent = String(i + 1);
      detail.textContent = '대기';
    }
  });
}
function runDemoOCR() {
  if (!selectedFile || ocrRunning) return;

  ocrRunning = true;
  $('ocrBtn').disabled = true;
  $('ocrBtn').textContent = 'OCR 처리 중...';
  $('ocrProcessing').style.display = 'block';
  $('docPreview').classList.add('processing');
  $('resultContent').style.display = 'none';
  $('emptyResult').style.display = 'flex';

  let stageIndex = 0;

  updateOCRStage(stageIndex);
  toast('OCR 처리 흐름을 시연합니다.');

  const stageTimer = setInterval(() => {
    stageIndex++;

    if (stageIndex < demoStages.length) {
      updateOCRStage(stageIndex);
      return;
    }

    clearInterval(stageTimer);

    $('progressFill').style.width = '100%';
    $('processingPercent').textContent = '100%';
    $('processingIcon').textContent = '✓';
    $('processingTitle').textContent = '시안 처리 흐름 완료';
    $('processingMessage').textContent =
      '이제 3번 영역에서 예시 결과를 확인할 수 있습니다.';

    const lastStep = $('ocrStep3');
    lastStep.classList.remove('active');
    lastStep.classList.add('done');
    lastStep.querySelector('.step-status').textContent = '✓';
    lastStep.querySelector('.step-detail').textContent = '완료';

    $('docPreview').classList.remove('processing');

    // 실제 OCR 결과가 아닌 기존 시안용 샘플 표시
    loadDemoResult();
    setTab('original');

    $('ocrBtn').textContent = '다시 시연하기';
    $('ocrBtn').disabled = false;
    ocrRunning = false;

    toast('시안 처리 흐름이 완료되었습니다. 예시 결과를 확인하세요.');
  }, 1200);
}
$('ocrBtn').onclick = runDemoOCR;
function loadDemoResult(){
 if(demoReady)return;
 demoReady=true;
 $('emptyResult').style.display='none';
 $('resultContent').style.display='block';
 $('originalText').value='示範文書\\n\\n이곳에 OCR로 인식된 원문이 표시됩니다.\\n고문헌의 한자와 옛한글 등은 문서 상태에 따라 인식 결과가 달라질 수 있습니다.\\n\\n※ 실제 엔진과 연결되지 않은 시안용 예시 텍스트입니다.';
 $('translationText').textContent='이곳에 원문을 바탕으로 한 현대어 번역 예시가 표시됩니다.\\n\\n※ 실제 번역 결과가 아닌 화면 시연용 문구입니다.';
 $('resultStatus').textContent='✓ 시안용 예시 결과';
 $('resultNote').textContent='시안 데이터입니다. 실제 OCR 정확도나 처리 성능을 나타내지 않습니다.';
}
function setTab(tab){
 activeTab=tab;
 document.querySelectorAll('.tab').forEach(b => {
    const selected = b.dataset.tab === tab;
    b.classList.toggle('active', selected);
    b.setAttribute('aria-pressed', String(selected));
  });
  $('originalText').style.display =
    tab === 'original' ? 'block' : 'none';

  $('translationText').style.display =
    tab === 'modern' ? 'block' : 'none';

  $('copyBtn').style.display =
    tab === 'original' ? 'inline-block' : 'none';

  $('translateBtn').textContent =
    tab === 'modern' ? '현대어 번역 표시 중' : '현대어 번역 보기';

  $('resultStatus').textContent =
    tab === 'modern' ? '✓ 현대어 번역 예시' : '✓ 시안용 원문 결과';
}
document.querySelectorAll('.tab').forEach(b => {
  b.onclick = () => {
    if (!selectedFile) {
      toast('먼저 문서를 업로드해 주세요.');
      return;
    }

    if (!demoReady) {
      toast('OCR 실행 버튼을 눌러 결과를 확인해 주세요.');
      return;
    }

    setTab(b.dataset.tab);
  };
});
$('translateBtn').onclick = () => {
  // 파일이 없으면 알림만 표시
  if (!selectedFile) {
    toast('먼저 문서를 업로드해 주세요.');
    return;
  }

  // 파일은 있지만 OCR을 실행하지 않았다면 안내
  if (!demoReady) {
    toast('OCR 실행 버튼을 눌러 결과를 확인해 주세요.');
    return;
  }

  // 조건이 충족되면 기존 버튼 기능 실행
  setTab('modern');
};
$('copyBtn').onclick=async()=>{try{await navigator.clipboard.writeText($('originalText').value);toast('원문 예시를 복사했습니다.')}catch(e){$('originalText').select();document.execCommand('copy');toast('원문 예시를 복사했습니다.')}};
$('downloadBtn').onclick=()=>{if(!demoReady)return;const text=activeTab==='modern'?$('translationText').textContent:$('originalText').value;const blob=new Blob([text],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='tangoai_ocr_시안_예시.txt';a.click();URL.revokeObjectURL(a.href);toast('예시 텍스트 다운로드를 시작했습니다.')};
$('loginBtn').onclick=()=>toast('로그인 기능은 시안에 연결되어 있지 않습니다.');
