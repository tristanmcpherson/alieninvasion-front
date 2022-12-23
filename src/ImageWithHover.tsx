import { useSpring, animated, SpringValue } from '@react-spring/web';

type ImageWithHoverEffectProps = {
  src: string
  alt: string
}

function ImageWithHoverEffect({ src, alt }: ImageWithHoverEffectProps) {
  const [animationProps, setAnimationProps] = useSpring(() => ({
    transform: 'scale(1)',
  }))

  return (
    <animated.div
      style={animationProps}
      onMouseEnter={() => setAnimationProps({ transform: 'scale(1.1)' })}
      onMouseLeave={() => setAnimationProps({ transform: 'scale(1)' })}
    >
      <img src={src} alt={alt} />
    </animated.div>
  )
}