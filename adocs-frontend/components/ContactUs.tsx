"use client";

import { BiSolidMessageSquareDetail } from "react-icons/bi";
import { Button } from "./ui/button";
import { Field, FieldDescription, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { MdAttachEmail } from "react-icons/md";
import { IoSend } from "react-icons/io5";
import React, { useState } from "react";

const ContactUs = () => {
  const [subjectMail, setSubjectMail] = useState<string>("");
  const [textMail, setTextMail] = useState<string>("");
  const CheckInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value) {
      setSubjectMail(value);
    }
  };
  const CheckText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;
    if (value) {
      setTextMail(value);
    }
  };
  const SendMail = (e: React.MouseEvent<HTMLButtonElement>) => {
    window.open (`https://mail.google.com/mail/u/0/?fs=1&to=adocs.deploy@gmail.com&su=${encodeURIComponent(subjectMail)}&body=${encodeURIComponent(textMail)}&view=cm` , "_blank")
  }

  return (
    <div className="w-[95%] md:w-[70%] xl:w-[45%] flex justify-start flex-col items-center dark:bg-transparent mt-5 mb-15 rounded-xl py-2">
      <div className="flex items-center mt-5 md:mt-10 xl:mt-12 text-2xl md:text-4xl font-[700] text-black dark:text-white">
        Contact Us
      </div>
      <div className="flex items-start text-sm md:text-lg xl:text-lg font-[400] text-gray-500 mt-5 mb-5 text-center px-6">
        Questions about our container platform? Send us an email
      </div>
      <div className="w-full grid grid-cols-1 mt-5">
        <div className="flex flex-col gap-12">
          <Field className="group">
            <FieldLabel
              htmlFor="input-field-username"
              className="text-xl font-[700] flex items-center gap-3 transition duration-200"
            >
              <MdAttachEmail size={27} /> Subject
            </FieldLabel>
            <Input
              type="text"
              placeholder="Enter your subject"
              className="h-13 p-4 shadow-none"
              onChange={CheckInput}
            />
            <FieldDescription>Enter your topic.</FieldDescription>
          </Field>
          <Field className="group">
            <FieldLabel
              htmlFor="textarea-message"
              className="text-xl font-[700] flex items-center gap-3 transition duration-200"
            >
              <BiSolidMessageSquareDetail size={27} /> Message
            </FieldLabel>
            <Textarea
              id="textarea-message"
              placeholder="Type your message here."
              className="min-h-35 p-4 shadow-none"
              onChange={CheckText}
            />
            <FieldDescription>Enter your message in textarea.</FieldDescription>
          </Field>
          <Button onClick={(SendMail)} className="rounded-lg flex items-center gap-3 hover:gap-8 font-[600] text-md bg-black/85 hover:bg-black/5 hover:text-black h-13 p-5 dark:bg-white dark:hover:bg-white/5 dark:hover:text-white cursor-pointer">
            Send Message <IoSend />
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ContactUs;
