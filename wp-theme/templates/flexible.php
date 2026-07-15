<?php

/**
 * Template Name: Flexible
 */

get_header();
?>

<main id="main-content" class="grow">
  <?php if (function_exists('have_rows') && have_rows('content')): ?>
    <?php while (have_rows('content')):
      the_row(); ?>
      <?php get_template_part('template-parts/flexible/' . get_row_layout()); ?>
    <?php endwhile; ?>
  <?php endif; ?>
</main>

<?php get_footer(); ?>
