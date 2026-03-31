// Debug samples for each code type

export const debugSamples = {
  p5: [
    {
      code: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(0);
  stroke(255);
  noFill();
  ellipse(200, 200, 200, 200);
}`,
      explanation: 'Step 1: キャンバスを作成し、中心に白い正円を描画します。これがベースとなる形です。',
    },
    {
      code: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(0);
  stroke(255);
  noFill();

  // 極座標で円を描く
  beginShape();
  for (let a = 0; a < TWO_PI; a += 0.1) { // a = angle（角度）
    let r = 100; // r = radius（半径）
    let x = 200 + cos(a) * r;
    let y = 200 + sin(a) * r;
    vertex(x, y);
  }
  endShape(CLOSE);
}`,
      explanation: 'Step 2: ellipse()の代わりに極座標（角度と半径）で円を描きます。beginShape/endShapeとvertexを使い、角度を0〜TWO_PIまでループして頂点を打ちます。',
    },
    {
      code: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(0);
  stroke(255);
  noFill();

  // 極座標で歪んだ円を描く
  beginShape();
  for (let a = 0; a < TWO_PI; a += 0.1) { // a = angle（角度）
    let r = 100 + sin(a * 3) * 30; // r = radius + 歪み
    let x = 200 + cos(a) * r;
    let y = 200 + sin(a) * r;
    vertex(x, y);
  }
  endShape(CLOSE);
}`,
      explanation: 'Step 3: 半径rにsin(a * 3) * 30を加えて歪みを作ります。sin関数が角度に応じて半径を変化させるため、花びらのような形になります。',
    },
    {
      code: `let t = 0; // t = time（時間経過）

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(0);
  stroke(255);
  noFill();

  // 極座標で歪んだ円を描く（アニメーション付き）
  beginShape();
  for (let a = 0; a < TWO_PI; a += 0.1) { // a = angle（角度）
    let r = 100 + sin(a * 3 + t) * 30; // r = radius + 時間で動く歪み
    let x = 200 + cos(a) * r;
    let y = 200 + sin(a) * r;
    vertex(x, y);
  }
  endShape(CLOSE);

  t += 0.02; // 時間を進める
}`,
      explanation: 'Step 4: 時間変数tを追加し、sin関数の位相をずらすことでアニメーションさせます。形がゆっくり回転するように変化します。',
    },
    {
      code: `let t = 0; // t = time（時間経過）

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(0, 20); // 半透明の背景で残像効果
  stroke(255, 150);
  noFill();

  // 複数の歪んだ円を重ねて描く
  for (let j = 0; j < 3; j++) { // j = layer（レイヤー番号）
    beginShape();
    for (let a = 0; a < TWO_PI; a += 0.05) { // a = angle（角度）
      let n = 3 + j * 2; // n = 花びらの数（レイヤーごとに変化）
      let r = 80 + j * 30 + sin(a * n + t + j) * (20 + j * 10);
      let x = 200 + cos(a) * r;
      let y = 200 + sin(a) * r;
      vertex(x, y);
    }
    endShape(CLOSE);
  }

  t += 0.02;
}`,
      explanation: 'Step 5（完成）: 複数レイヤーの歪んだ円を重ね、残像効果（半透明background）を加えて幻想的な見た目に仕上げます。',
    },
  ],

  three: [
    {
      code: `const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;
renderer.render(scene, camera);`,
      explanation: 'Step 1: Three.jsの基本セットアップです。シーン・カメラ・レンダラーを作成し、空の画面を描画します。',
    },
    {
      code: `const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 立方体を作成
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;
renderer.render(scene, camera);`,
      explanation: 'Step 2: 緑のワイヤーフレーム立方体を追加します。BoxGeometryで形状、MeshBasicMaterialで見た目を定義し、Meshとしてシーンに追加します。',
    },
    {
      code: `const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 立方体を作成
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();`,
      explanation: 'Step 3: requestAnimationFrameでアニメーションループを作り、毎フレーム立方体を回転させます。',
    },
    {
      code: `const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ライティング
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// 立方体を作成（ライティング対応マテリアル）
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();`,
      explanation: 'Step 4（完成）: DirectionalLightとAmbientLightを追加し、MeshStandardMaterialに変更して立体感のある見た目に仕上げます。',
    },
  ],

  webgl: [
    {
      code: `const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext('webgl');

gl.clearColor(0.0, 0.0, 0.1, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);`,
      explanation: 'Step 1: WebGLコンテキストを取得し、画面を暗い青色でクリアします。これがWebGLの最小構成です。',
    },
    {
      code: `const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext('webgl');

// シェーダーソース
const vsSource = \`
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
\`;
const fsSource = \`
  precision mediump float;
  void main() {
    gl_FragColor = vec4(0.0, 1.0, 0.5, 1.0);
  }
\`;

// シェーダーのコンパイル
function createShader(gl, type, source) {
  const s = gl.createShader(type);
  gl.shaderSource(s, source);
  gl.compileShader(s);
  return s;
}

const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
gl.useProgram(program);

// 三角形の頂点データ
const vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const aPos = gl.getAttribLocation(program, 'aPosition');
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

gl.clearColor(0.0, 0.0, 0.1, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 3);`,
      explanation: 'Step 2: 頂点シェーダーとフラグメントシェーダーを書き、緑色の三角形を描画します。WebGLの基本パイプライン（シェーダー → プログラム → バッファ → 描画）の流れです。',
    },
    {
      code: `const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext('webgl');

const vsSource = \`
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
\`;
const fsSource = \`
  precision mediump float;
  uniform float uTime; // uTime = 経過時間
  uniform vec2 uResolution; // uResolution = 画面サイズ
  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    float r = 0.5 + 0.5 * sin(uTime + uv.x * 6.0);
    float g = 0.5 + 0.5 * sin(uTime * 0.7 + uv.y * 6.0);
    float b = 0.5 + 0.5 * sin(uTime * 1.3 + (uv.x + uv.y) * 3.0);
    gl_FragColor = vec4(r, g, b, 1.0);
  }
\`;

function createShader(gl, type, source) {
  const s = gl.createShader(type);
  gl.shaderSource(s, source);
  gl.compileShader(s);
  return s;
}

const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
gl.useProgram(program);

// フルスクリーン四角形
const vertices = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
const aPos = gl.getAttribLocation(program, 'aPosition');
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

const uTime = gl.getUniformLocation(program, 'uTime');
const uRes = gl.getUniformLocation(program, 'uResolution');
gl.uniform2f(uRes, canvas.width, canvas.height);

function render(t) { // t = timestamp（ミリ秒）
  gl.uniform1f(uTime, t * 0.001);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);`,
      explanation: 'Step 3（完成）: フラグメントシェーダーにuTimeとuResolutionを渡し、UV座標と時間で色を変化させるアニメーションシェーダーを作ります。画面全体が虹色に波打ちます。',
    },
  ],
};
