import { ComponentType, ReactNode } from 'react'

import { LogoNoBorder, LogoProps } from './Logo'

export interface GradientWrapperProps {
  Logo?: ComponentType<LogoProps>
  children: ReactNode
}

export const GradientWrapper = ({
  Logo = LogoNoBorder,
  children,
}: GradientWrapperProps) => (
  <div className="flex overflow-x-hidden relative flex-col items-center">
    {typeof CSS.supports !== 'undefined' &&
      // eslint-disable-next-line i18next/no-literal-string
      CSS.supports('backdrop-filter', 'blur(5px)') && (
        <div
          className="absolute top-0 left-1/2 -z-20 mt-[60px] -ml-[250px] text-[#06090B]"
          style={{ transform: 'rotate(270)' }}
        >
          <Logo size={500} />
        </div>
      )}
    <div
      className="absolute -z-30 w-screen h-full bg-no-repeat bg-contain"
      style={{
        backgroundImage: 'url(/gradients/BG-Gradient-Dark@2x.png)',
      }}
    ></div>
    <div className="fixed -z-10 w-screen h-screen bg-clip-padding backdrop-blur-3xl backdrop-filter"></div>
    {children}
  </div>
)
