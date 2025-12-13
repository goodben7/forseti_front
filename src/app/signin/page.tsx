import SignInForm from '@/app/signin/sign-in-form';
import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import AuthSlider from '@/app/signin/auth-slider';
import Image from 'next/image';
import UnderlineShape from '@core/components/shape/underline';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Sign In'),
};

export default function SignIn() {
  return (
    <AuthWrapperOne
      title={
        <>
          Là où <span className="text-[#D4AF37]">Forseti</span> éclaire, <br className="hidden lg:inline" />{' '}
          <span className="relative inline-block">
            l’ordre prend forme.
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-full text-[#D4AF37]" />
          </span>
        </>
      }
      description=""
      isSocialLoginActive={false}
      pageImage={
        <div className="relative h-full w-full">
          <AuthSlider />
        </div>
      }
    >
      <SignInForm />
    </AuthWrapperOne>
  );
}
