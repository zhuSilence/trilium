import libraryLoader from "../../services/library_loader.js";

// 高德开放平台 key
const key = '78c4ef788d3913e7b5874d1e623efdc3';

async function getLunarDay() {
    // Get the current Gregorian date
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dayOfWeek = getDayOfWeek(`${year}-${month}-${day}`);

    // Load the library for calculating lunar dates
    await libraryLoader.requireLibrary(libraryLoader.LUNAR_FUN);

    // Convert the current Gregorian date to lunar date
    const lun = lunarFun.gregorianToLunal(year, month, day);

    // Get the lunar year, month, and day corresponding to the current Gregorian date
    const lunYear = lunarFun.getHeavenlyStems(year) + lunarFun.getEarthlyBranches(year);
    const lunMonth = lun[1] === 1 ? '正' : lun[1];
    const lunDay = lun[2].toString().length === 2 ? lun[2] : '初 ' + lun[2];

    // Assemble the final string
    return `${year}-${month}-${day} 农历 ${lunYear} 年 ${lunMonth} 月 ${lunDay} ${dayOfWeek}`;
}

async function getWeather() {
    const location = await getLocation();
    // 调用高德获取天气接口
    return await fetch('https://restapi.amap.com/v3/weather/weatherInfo?key=' + key + '&city=' + location.adcode + '&extensions=all&output=JSON')
        .then(response => response.json())
        .then(result => {
            return {
                city: result.forecasts[0].city,
                dayweather: result.forecasts[0].casts[0].dayweather
            };
        }).catch((error) => console.error('Error:', error));
}

async function getLocation() {
    // 调用高德定位接口
    return await fetch('https://restapi.amap.com/v3/ip?key=' + key)
        .then(response => response.json())
        .then(async data => {
                return {
                    adcode: data.adcode
                }
            }
        )
        .catch((error) => console.error('Error:', error));
}

/**
 * Get the lunar day corresponding to the current date.
 * @returns {string} The formatted string representing the lunar day.
 */

function getDayOfWeek(dateString) {
    const daysOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return daysOfWeek[dayOfWeek];
}

export default {
    getDayOfWeek,
    getWeather,
    getLunarDay
}
