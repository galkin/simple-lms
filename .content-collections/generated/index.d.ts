import configuration from "../../content-collections.ts";
import { GetTypeByName } from "@content-collections/core";

export type Lesson = GetTypeByName<typeof configuration, "lessons">;
export declare const allLessons: Array<Lesson>;

export {};
