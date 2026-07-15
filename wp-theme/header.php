<!doctype html>
<html <?php language_attributes(); ?>>

<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
  <?php wp_body_open(); ?>
  <div class="flex min-h-screen w-full flex-col overflow-clip">
    <a class="sr-only" href="#main-content">Skip to content</a>

    <?php get_template_part('template-parts/header', 'default'); ?>