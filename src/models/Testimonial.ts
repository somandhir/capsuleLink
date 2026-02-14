import mongoose, { Schema } from "mongoose";
import { ITestimonial } from "@/types";

const testimonialSchema = new mongoose.Schema<ITestimonial>(
  {
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      default: "Anonymous",
    },
    content: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
    },
    rating: {
      type: Number,
    },
  },
  { timestamps: true },
);

const Testimonial =
  (mongoose.models.Testimonial as mongoose.Model<ITestimonial>) ||
  mongoose.model("Testimonial", testimonialSchema);
export default Testimonial;
