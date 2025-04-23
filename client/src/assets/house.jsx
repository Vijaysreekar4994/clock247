const CustomHouseIcon = ({ fill = "#efefefd7", text }) => {
  // Responsive font size and width based on screen size
  const screenWidth = window.innerWidth;

  const width =
    screenWidth < 400 ? 100 :
    screenWidth < 600 ? 140 : 200;

  const fontSize =
    screenWidth < 400 ? 80 :
    screenWidth < 600 ? 90 : 100;

  return (
    <svg
      width={width}
      height={width} // keeping it square
      viewBox="0 0 345.804 345.804"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      stroke={fill}
    >
      {/* House Path */}
      <path d="M343.288,159.838L181.905,27.941c-5.242-4.283-12.77-4.283-18.009,0l-41.336,33.79V44.193
        c0-3.788-3.066-6.848-6.854-6.848H75.928c-3.788,0-6.854,3.063-6.854,6.848v61.251L2.516,159.838
        c-2.933,2.391-3.36,6.711-0.97,9.641c1.357,1.654,3.33,2.523,5.32,2.523c1.524,0,3.053-0.511,4.328-1.545l34.55-28.245v172.011
        c0,3.785,3.066,6.852,6.846,6.852h240.626c3.781,0,6.854-3.066,6.854-6.852V142.216l34.55,28.245
        c1.273,1.037,2.807,1.545,4.326,1.545c1.984,0,3.956-0.87,5.314-2.524C346.648,166.549,346.221,162.235,343.288,159.838z
        M82.779,51.041h26.071v21.888l-26.071,21.31V51.041z M286.367,307.369H59.44V131.015l107.596-87.939
        c3.414-2.791,8.316-2.791,11.731,0l107.6,87.939V307.369z" />
      
      {/* Centered Text */}
      <text
        x="50%"
        y="65%"
        textAnchor="middle"
        fill={fill}
        fontSize={fontSize}
        dominantBaseline="middle"
      >
        {text}
      </text>
    </svg>
  );
};

export default CustomHouseIcon;
