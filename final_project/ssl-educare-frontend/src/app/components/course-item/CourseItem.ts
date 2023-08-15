import { CoursePost } from "../course-post/CoursePost"

export class CourseItem {
    code! : string      // ! for Property 'code' has no initializer and is not definitely assigned in the constructor.
    name! : string
    posts! : CoursePost[]
    // and so on...
}