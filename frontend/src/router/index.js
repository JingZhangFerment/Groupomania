import { createWebHistory, createRouter } from "vue-router";
import ConnectView from "@/views/ConnectView.vue";
import ProfileView from "@/views/ProfileView.vue";
import MyPostView from "@/views/MyPostView.vue";
import ListOfPostsView from "@/views/ListOfPostsView.vue";
import ModifyPostView from "@/views/ModifyPostView.vue";

const routes = [
  {
    name: "connect",
    path: "/",
    component: ConnectView,
  },

  {
    name: "profile",
    path: "/profile",
    component: ProfileView,
  },

  {
    name: "post",
    path: "/post",
    component: MyPostView,
  },

  {
    name: "list",
    path: "/list",
    component: ListOfPostsView,
  },

  {
    name: "modifyPost",
    path: "/post/:id",
    component: ModifyPostView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
