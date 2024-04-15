#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use directories::ProjectDirs;
use tao::{
    dpi::PhysicalSize,
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoop},
    window::{Icon, WindowBuilder},
};
use wry::{WebContext, WebViewBuilder};

fn setup_project_directories() -> wry::Result<ProjectDirs> {
    Ok(ProjectDirs::from("host", "pyro", "desktop").expect("Failed to get project directories"))
}

fn setup_window(event_loop: &EventLoop<()>) -> wry::Result<tao::window::Window> {
    Ok(WindowBuilder::new()
        .with_title("Pyrodactyl Panel")
        .with_theme(Some(tao::window::Theme::Dark))
        .with_min_inner_size(PhysicalSize::new(1280, 720))
        .with_window_icon(Some(
            Icon::from_rgba(include_bytes!("../assets/icon.rgba").to_vec(), 512, 512)
                .expect("Failed to load window icon"),
        ))
        .build(event_loop)
        .expect("Failed to create window"))
}

fn main() -> wry::Result<()> {
    let project_directories = setup_project_directories()?;
    let data_dir = project_directories.data_dir();

    let event_loop = EventLoop::new();
    let window = setup_window(&event_loop)?;

    let _webview = WebViewBuilder::new(&window)
        .with_web_context(&mut WebContext::new(Some(data_dir.to_path_buf())))
        .with_user_agent(&format!(
            "PyrodactylDesktop/{} ({}; {})",
            env!("CARGO_PKG_VERSION"),
            std::env::consts::OS,
            std::env::consts::ARCH,
        ))
        .with_background_color((0, 0, 0, 255))
        .with_url("https://panel.pyro.host")
        .build()?;

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        if let Event::WindowEvent {
            event: WindowEvent::CloseRequested,
            ..
        } = event
        {
            *control_flow = ControlFlow::Exit
        }
    })
}
