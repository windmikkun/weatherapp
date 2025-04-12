//APIKEY
//天気API
const API_KEY = "970d2e235c233266a316de602c3b95b3";

//ページ読み込みの際に現在の位置を取得
document.addEventListener('DOMContentLoaded', getWeatherData);

//speechSynthesis機能
//利用可能か確認
if(!'speechSynthesis' in window) {
    alert("このブラウザは音声合成に対応していません")
} 

//現在の位置を取得
function getLocation() {
    return new Promise((resolve, reject) => {
        if(!navigator.geolocation) {
            reject(new Error("お使いのブラウザでは使用できません"));
        } else {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        }
    });
}

//天気データを取得
//latitude 緯度, longitude 経度, units 単位,metric 摂氏, lang 言語
async function getWeatherData() {
    const weatherDiv = document.getElementById("weather");

    try {
        //現在の位置を取得
        const position = await getLocation();
        const {latitude, longitude} = position.coords;

        weatherDiv.innerHTML = '<div class="loading>"位置を取得中..."</div>';

        // OpenWeatherMap APIから天気データを取得
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=ja`
        );

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('無効なAPIキーです。');
            } else if (response.status === 404) {
                throw new Error('位置情報が見つかりません。');
            } else if (response.status === 429) {
                throw new Error('リクエスト頻度制限を超えました。');
            } else {
                throw new Error(`HTTPエラー: ${response.status}`);
            }
        }

        const data = await response.json();

        //天気データを表示
        //APIからアイコンを取得して表示する
        const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        weatherDiv.innerHTML = `
            <h2>${data.name}</h2>
            <p>天気: ${data.weather[0].description}</p>
            <p>気温: <span class="temp">${Math.round(data.main.temp)}°C</span></p>
            <p>湿度: ${data.main.humidity}%</p>
            <p>風速: ${data.wind.speed}m/s</p>
            <img src="${iconUrl}" alt="${data.weather[0].description}" class="weather-icon">
        `;

        //音声読み上げ処理
        readWeatherAloud(data);
    } catch (error) {
        weatherDiv.innerHTML = `<p style="color:red;">エラー: ${error.message}</p>`;
    }
}

//音声読み上げ関数
function readWeatherAloud(data){
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance();
    utterance.lang = "ja-JP";
    utterance.text = `現在の${data.name}の天気は${data.weather[0].description}です。気温は${Math.round(data.main.temp)}度。湿度は${data.main.humidity}%です。また風速は${data.wind.speed}メートルです。`;
    speechSynthesis.speak(utterance);
}

