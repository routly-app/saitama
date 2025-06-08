import { object, string } from "yup";
import { useSearchParam } from "react-use";
import { TabPanel } from "@headlessui/react";
import { Formik, Form, Field } from "formik";
import { MdOutlineEmail } from "react-icons/md";

import Loading from "../Loading";
import { globalActions } from "../../store/global";
import { useAPI } from "../../contexts/APIContext";
import withSuspense from "../../composables/withSuspense";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

type SignUpTabProps = {
  as?: React.ElementType;
  onNext: React.Dispatch<React.SetStateAction<void>>;
};

const SignUpTab = withSuspense(function SignUpTab({
  as = TabPanel,
  onNext,
}: SignUpTabProps) {
  const As = as;
  const { api } = useAPI();

  const dispatch = useAppDispatch();
  const email = useSearchParam("email");
  const { customer } = useAppSelector((state) => state.global);

  return (
    <As className="flex-1 flex flex-col p-4">
      <Formik
        initialValues={{
          email: email
            ? email
            : customer && customer.email
            ? customer.email
            : String(),
        }}
        validationSchema={object({
          email: string().email().required(),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          return api.customer
            .create({ email: values.email })
            .then(({ data }) => {
              dispatch(globalActions.setCustomer(data));
              return onNext();
            })
            .finally(() => setSubmitting(false));
        }}
      >
        {({ isSubmitting, errors }) => (
          <Form className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col">
              <div className="flex flex-col space-y-2">
                <div className="group flex items-center border-1 border-stone-700 rounded focus-within:border-violet-700">
                  <MdOutlineEmail className="text-xl ml-2 text-stone-500 group-focus-within:text-violet-700 dark:text-stone" />
                  <Field
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    className="flex-1 p-3 bg-transparent !outline-none placeholder-text-stone-500 dark:placeholder-text-stone-400"
                  />
                </div>
                {errors.email ? (
                  <small className="text-red text-xs first-letter:uppercase">
                    {errors.email.slice(0, 1).toUpperCase()}
                    {errors.email.slice(1)}
                  </small>
                ) : (
                  <p className="text-xs text-black/75 dark:text-stone-300">
                    Get transaction updates and reciept notifications via email.
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center space-x-4 !bg-violet-700 text-white p-2.5 rounded-md"
            >
              <span>Continue</span>
              {isSubmitting && <Loading className="size-5 border-white" />}
            </button>
          </Form>
        )}
      </Formik>
    </As>
  );
});

export default SignUpTab;
