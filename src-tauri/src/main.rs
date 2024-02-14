// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#[macro_use]
extern crate lazy_static;
extern crate native_windows_gui as nwg;
use std::sync::Mutex;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
lazy_static! {
    static ref N_S: Mutex<bool> = Mutex::new(false);
}
#[allow(dead_code)]
#[tauri::command]
fn get_needs_saving(needs_saving: bool) {
    let mut my_bool = N_S.lock().unwrap();
    *my_bool = needs_saving;
}

#[tauri::command]
fn quit(){
  std::process::exit(0);
}

fn main() {
    tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_needs_saving, quit])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
