/*
 * Global game parameters for the primary canvas.
 *
 * Copyright (C) 2020, Josh Don
 *
 * Project Sand is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Project Sand is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const __horizontal_margin = 6;
const __vertical_margin = 200;
const __min_width = 320;
const __min_height = 240;

/* Size the canvas to fill the viewport while leaving room for the controls below */
const width = Math.max(window.innerWidth - __horizontal_margin, __min_width);
const height = Math.max(window.innerHeight - __vertical_margin, __min_height);

const MAX_FPS = 120;
const DEFAULT_FPS = 60;

const MAX_NUM_PARTICLES = 1000;

/*
 * The zombie animation speed is tied to the FPS setting of the game;
 * speeding or slowing the FPS will also change the zombie animation
 * speed. The following value provides the baseline speed, which then
 * becomes scaled by the FPS. Note that the animation engine has a limit
 * to how much it can simulate in each step, so the following value should
 * not be made too large.
 */
const ZOMBIE_ANIMATION_SPEED = 12;

const MAX_ZOMBIES = 60;
