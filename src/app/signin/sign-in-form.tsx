'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { SubmitHandler } from 'react-hook-form';
import { PiArrowRightBold } from 'react-icons/pi';
import { Checkbox, Password, Button, Input, Text } from 'rizzui';
import { Form } from '@core/ui/form';
import { routes } from '@/config/routes';
import { loginSchema, LoginSchema } from '@/validators/login.schema';
import toast from 'react-hot-toast';

const initialValues: LoginSchema = {
  email: '',
  password: '',
  rememberMe: true,
};

export default function SignInForm() {
  const [reset, setReset] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        ...data,
        redirect: false,
      });

      if (result?.error) {
        // Show specific error message from API or generic message
        const errorMessage = result.error === 'CredentialsSignin'
          ? 'Identifiants invalides. Vérifiez votre email et mot de passe.'
          : result.error;
        toast.error(errorMessage);
      } else if (result?.ok) {
        toast.success('Connexion réussie !');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form<LoginSchema>
        validationSchema={loginSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        useFormProps={{
          defaultValues: initialValues,
        }}
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-5">
            <Input
              type="email"
              size="lg"
              label="Identifiant"
              placeholder="Entrez votre identifiant"
              className="[&>label>span]:font-medium [&>label>span]:font-lexend"
              inputClassName="text-sm font-lexend"
              {...register('email')}
              error={errors.email?.message}
            />
            <Password
              label="Mot de passe"
              placeholder="Entrez votre mot de passe"
              size="lg"
              className="[&>label>span]:font-medium [&>label>span]:font-lexend"
              inputClassName="text-sm font-lexend"
              {...register('password')}
              error={errors.password?.message}
            />
            <div className="flex items-center justify-between pb-2">
              <Checkbox
                {...register('rememberMe')}
                label="Se souvenir de moi"
                className="[&>label>span]:font-medium [&>label>span]:font-lexend [&_input:checked]:!bg-[#D4AF37] [&_input:checked]:!border-[#D4AF37]"
              />
              <Link
                href={routes.auth.forgotPassword1}
                className="h-auto p-0 text-sm font-semibold text-blue underline transition-colors hover:text-gray-900 hover:no-underline font-lexend"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <Button
              className="w-full bg-[#D4AF37] hover:bg-[#b8952b] text-white font-lexend"
              type="submit"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              <span>{isLoading ? 'Connexion en cours...' : 'Se connecter'}</span>{' '}
              {!isLoading && <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />}
            </Button>
          </div>
        )}
      </Form>

    </>
  );
}
