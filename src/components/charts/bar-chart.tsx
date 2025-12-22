interface BarChartProps {
  data: {
    month: string;
    value: number;
  }[];
  height: number;
  barColor: string;
  labelText: string;
}

const BarChart = ({ data, height, barColor, labelText }: BarChartProps) => {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div style={{ height: `${height}px` }} className='relative'>
      <div className='flex h-full items-end justify-between'>
        {data.map((item) => {
          const barHeight = (item.value / maxValue) * 100;

          return (
            <div key={item.month} className='mx-1 flex flex-col items-center'>
              <div
                className='w-10 rounded-md transition-all duration-300'
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: barColor,
                  minHeight: item.value > 0 ? '8px' : '0',
                }}
              />
              <div className='mt-2 text-xs text-gray-500'>{item.month}</div>
            </div>
          );
        })}
      </div>

      <div className='absolute right-0 bottom-8 left-0 text-center text-xs text-gray-600'>
        {labelText}
      </div>

      {/* Y-axis labels */}
      <div className='absolute top-0 -left-8 flex h-full flex-col justify-between text-xs text-gray-500'>
        <span>{maxValue}</span>
        <span>{Math.round(maxValue / 2)}</span>
        <span>0</span>
      </div>
    </div>
  );
};

export default BarChart;
