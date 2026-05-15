import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "@/lib/utils";

interface SliderProps extends SliderPrimitive.Root.Props {
  controlProps?: SliderPrimitive.Control.Props;
  trackProps?: SliderPrimitive.Track.Props;
  indicatorProps?: SliderPrimitive.Indicator.Props;
  thumbProps?: SliderPrimitive.Thumb.Props;
  renderThumb?: (index: number) => React.ReactNode;
  renderTrack?: (defaultTrack: React.ReactNode) => React.ReactNode;
  renderIndicator?: (
    defaultIndicator: React.ReactNode,
    index: number,
  ) => React.ReactNode;
  hideTrack?: boolean;
  hideIndicator?: boolean;
  hideThumb?: boolean;
  thumbCount?: number;
}

function CustomSlider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  controlProps,
  trackProps,
  indicatorProps,
  thumbProps,
  renderThumb,
  renderTrack,
  renderIndicator,
  hideTrack = false,
  hideIndicator = false,
  hideThumb = false,
  thumbCount,
  ...props
}: SliderProps) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min];

  const length = thumbCount ?? _values.length;

  const { className: controlClassName, ...restControlProps } =
    controlProps || {};
  const { className: trackClassName, ...restTrackProps } = trackProps || {};
  const { className: indicatorClassName, ...restIndicatorProps } =
    indicatorProps || {};
  const { className: thumbClassName, ...restThumbProps } = thumbProps || {};

  const indicatorEl = !hideIndicator && (
    <SliderPrimitive.Indicator
      data-slot="slider-range"
      {...restIndicatorProps}
      className={cn(
        "bg-primary select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
        indicatorClassName,
      )}
    />
  );

  const trackEl = !hideTrack && (
    <SliderPrimitive.Track
      data-slot="slider-track"
      {...restTrackProps}
      className={cn(
        "relative grow overflow-hidden rounded-full bg-muted select-none data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1",
        trackClassName,
      )}
    >
      {renderIndicator ? renderIndicator(indicatorEl, 0) : indicatorEl}
    </SliderPrimitive.Track>
  );

  return (
    <SliderPrimitive.Root
      className={cn(
        "data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
        className,
      )}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control
        {...restControlProps}
        className={cn(
          "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
          controlClassName,
        )}
      >
        {renderTrack ? renderTrack(trackEl) : trackEl}

        {!hideThumb &&
          Array.from({ length }, (_, index) => (
            <SliderPrimitive.Thumb
              {...restThumbProps}
              data-slot="slider-thumb"
              key={index}
              className={cn(
                "relative block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50",
                thumbClassName,
              )}
            >
              {renderThumb ? renderThumb(index) : null}
            </SliderPrimitive.Thumb>
          ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { CustomSlider };
