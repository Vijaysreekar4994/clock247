// Clear Sky (0)
import { WiDaySunny } from "react-icons/wi";

// Mainly clear, partly cloudy, and overcast (1, 2, 3)
import { WiDayCloudy } from "react-icons/wi";

// Fog, depositing rime fog (45, 48)
import { WiFog } from "react-icons/wi";

// Drizzle: Light, moderate, and dense intensity (51, 53, 55)
import { WiSprinkle } from "react-icons/wi";

// Freezing Drizzle: Light and dense intensity (56, 57)
import { WiRainMix } from "react-icons/wi";

// Rain: Slight, moderate, and heavy intensity (61, 63, 65)
import { WiRain } from "react-icons/wi";

// Freezing Rain: Light and heavy intensity (66, 67)
import { WiSleet } from "react-icons/wi";

// Snow fall: Slight, moderate, and heavy intensity (71, 73, 75)
import { WiSnow } from "react-icons/wi";

// Snow grains (77)
import { WiSnowflakeCold } from "react-icons/wi";

// Rain showers: Slight, moderate, and violent (80, 81, 82)
import { WiShowers } from "react-icons/wi";

// Snow showers slight and heavy (85, 86)
import { WiSnowWind } from "react-icons/wi";

// Thunderstorm: Slight or moderate (95)
import { WiThunderstorm } from "react-icons/wi";

// Thunderstorm with slight and heavy hail (96, 99)
import { WiStormShowers } from "react-icons/wi";
// import { MdModeNight } from "react-icons/md"; TODO: implement it.


const weatherIconMap = {
  0: <WiDaySunny />,
  1: <WiDayCloudy />,
  2: <WiDayCloudy />,
  3: <WiDayCloudy />,
  45: <WiFog />,
  48: <WiFog />,
  51: <WiSprinkle />,
  53: <WiSprinkle />,
  55: <WiSprinkle />,
  56: <WiRainMix />,
  57: <WiRainMix />,
  61: <WiRain />,
  63: <WiRain />,
  65: <WiRain />,
  66: <WiSleet />,
  67: <WiSleet />,
  71: <WiSnow />,
  73: <WiSnow />,
  75: <WiSnow />,
  77: <WiSnowflakeCold />,
  80: <WiShowers />,
  81: <WiShowers />,
  82: <WiShowers />,
  85: <WiSnowWind />,
  86: <WiSnowWind />,
  95: <WiThunderstorm />,
  96: <WiStormShowers />,
  99: <WiStormShowers />,
};

export default weatherIconMap;
