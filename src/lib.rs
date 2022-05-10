mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

type Color = u32;

#[wasm_bindgen]
pub struct Grid {
    width: u32,
    height: u32,
    grid: Vec<Color>,
}

// Console log helper function.
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
impl Grid {
    pub fn new(width: u32, height: u32) -> Grid {
        utils::set_panic_hook();

        let mut grid = Vec::new();
        for _ in 0..(width * height) {
            grid.push(0);
        }

        Grid {
            width,
            height,
            grid,
        }
    }

    pub fn set(&mut self, x: u32, y: u32, color: Color) {
        let index = (y * self.width) + x;
        self.grid[index as usize] = color;
    }

    pub fn tick(&mut self) {
        let max = self.grid.len() - self.width as usize - 1;
        for index in (1..max).rev() {
            if !self.is_empty(index as u32) {
                self.update_pixel(index as u32)
            }
        }
    }

    pub fn grid(&self) -> *const Color {
        self.grid.as_ptr()
    }
}

impl Grid {
    fn update_pixel(&mut self, index: u32) {
        let below = index + self.width;
        let below_left = below - 1;
        let below_right = below + 1;

        if self.is_empty(below) {
            self.swap(index, below)
        } else if self.is_empty(below_left) {
            self.swap(index, below_left)
        } else if self.is_empty(below_right) {
            self.swap(index, below_right)
        }
    }

    pub fn swap(&mut self, a: u32, b: u32) {
        let index_a = a as usize;
        let index_b = b as usize;
        let tmp = self.grid[index_a];
        self.grid[index_a] = self.grid[index_b];
        self.grid[index_b] = tmp;
    }

    pub fn is_empty(&self, index: u32) -> bool {
        self.grid[index as usize] == 0
    }
}

#[wasm_bindgen]
pub fn pack_hsl(h: u8, s: u8, l: u8) -> u32 {
    return (h as u32) << 16 | (s as u32) << 8 | (l as u32);
}
