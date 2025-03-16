#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
use db::{Database, GameInstance, CategoryInstance};
use tokio::sync::OnceCell;
use tauri::command;
use dotenvy::dotenv;

static DATABASE: OnceCell<Database> = OnceCell::const_new();

// Command to save a game
#[command]
async fn save_game(
    category_name: String,
    instance_name: String,
    price_per_hour: f64,
    elapsed_time: Option<i64>,
    total_cost: f64,
    start_time: String,
    end_time: Option<String>,
) -> Result<(), String> {
    let db = DATABASE.get().expect("Database should be initialized");
    eprintln!("Received parameters:");
    eprintln!("category_name: {:?}", category_name);
    eprintln!("instance_name: {:?}", instance_name);
    eprintln!("price_per_hour: {:?}", price_per_hour);
    eprintln!("elapsed_time: {:?}", elapsed_time);
    eprintln!("total_cost: {:?}", total_cost);
    eprintln!("start_time: {:?}", start_time);
    eprintln!("end_time: {:?}", end_time);

    db.insert_game(
        &category_name,
        &instance_name,
        price_per_hour,
        elapsed_time,
        total_cost,
        &start_time,
        end_time.as_deref(),
    ).await.map_err(|e| {
        eprintln!("Error inserting game: {}", e); // Log the error
        e.to_string()
    })?;

    Ok(())
}

#[command]
async fn delete_game_by_id(id: i16) -> Result<(), String> {
    let db = DATABASE.get().expect("Database should be initialized");

    db.delete_game_by_id(id)
        .await
        .map_err(|e| {
            eprintln!("Error deleting game: {}", e);
            e.to_string()
        })?;

    Ok(())
}

#[command]
async fn delete_game(category_name: String, instance_name: String) -> Result<(), String> {
    let db = DATABASE.get().expect("Database should be initialized");

    db.delete_game_by_category_and_instance(&category_name, &instance_name)
        .await
        .map_err(|e| {
            eprintln!("Error deleting game: {}", e);
            e.to_string()
        })?;

    Ok(())
}

// Command to fetch distinct game instances
#[command]
async fn get_game_instances() -> Result<Vec<GameInstance>, String> {
    let db = DATABASE.get().expect("Database should be initialized");

    let instances = db
        .get_game_instances()
        .await
        .map_err(|e| e.to_string())?;

    Ok(instances)
}

#[command]
async fn delete_game_by_category_and_instance(category_name: String, instance_name: String) -> Result<(), String> {
    let db = DATABASE.get().expect("Database should be initialized");

    db.delete_game_by_category_and_instance(&category_name, &instance_name)
        .await
        .map_err(|e| {
            eprintln!("Error deleting game: {}", e);
            e.to_string()
        })?;

    Ok(())
}

// Command to fetch daily data
#[command]
async fn fetch_daily_data(category_name: Option<String>, instance_name: Option<String>) -> Result<Vec<GameInstance>, String> {
    let db: &Database = DATABASE.get().expect("Database should be initialized");
    db.fetch_daily_data(category_name.as_deref(), instance_name.as_deref())
        .await
        .map_err(|e| e.to_string())
}



// Command to fetch weekly data
#[command]
async fn fetch_weekly_data(category_name: Option<String>, instance_name: Option<String>) -> Result<Vec<GameInstance>, String> {
    let db: &Database = DATABASE.get().expect("Database should be initialized");
    db.fetch_weekly_data(category_name.as_deref(), instance_name.as_deref())
        .await
        .map_err(|e| e.to_string())
}

// Command to fetch monthly data
#[command]
async fn fetch_monthly_data(category_name: Option<String>, instance_name: Option<String>) -> Result<Vec<GameInstance>, String> {
    let db = DATABASE.get().expect("Database should be initialized");
    db.fetch_monthly_data(category_name.as_deref(), instance_name.as_deref())
        .await
        .map_err(|e| e.to_string())
}

// Command to fetch custom data
#[command]
async fn fetch_custom_data(category_name: Option<String>, instance_name: Option<String>, start_date: String, end_date: String) -> Result<Vec<GameInstance>, String> {
    let db = DATABASE.get().expect("Database should be initialized");
    db.fetch_custom_data(category_name.as_deref(), instance_name.as_deref(), &start_date, &end_date)
        .await
        .map_err(|e| e.to_string())
}
#[command]
async fn fetch_yearly_data(category_name: Option<String>, instance_name: Option<String>) -> Result<Vec<GameInstance>, String> {
    let db = DATABASE.get().expect("Database should be initialized");
    db.fetch_yearly_data(category_name.as_deref(), instance_name.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[command]
async fn get_category_instance_combinations() -> Result<Vec<CategoryInstance>, String> {
    let db = DATABASE.get().expect("Database should be initialized");

    let combinations = db
        .get_category_instance_combinations()
        .await
        .map_err(|e| e.to_string())?;

    Ok(combinations)
}

#[command]
async fn fetch_monthly_average(
    category_name: Option<String>,
    instance_name: Option<String>,
    month: String,
) -> Result<Vec<GameInstance>, String> {
    let db = DATABASE.get().expect("Database should be initialized");
    db.fetch_monthly_average(category_name.as_deref(), instance_name.as_deref(), &month)
        .await
        .map_err(|e| e.to_string())
}

#[command]
async fn fetch_yearly_average(
    category_name: Option<String>,
    instance_name: Option<String>,
    year: String,
) -> Result<Vec<GameInstance>, String> {
    let db = DATABASE.get().expect("Database should be initialized");
    db.fetch_yearly_average(category_name.as_deref(), instance_name.as_deref(), &year)
        .await
        .map_err(|e| e.to_string())
}


// Command to fetch distinct categories
#[command]
async fn get_distinct_categories() -> Result<Vec<String>, String> {
    let db = DATABASE.get().expect("Database should be initialized");

    let categories = db
        .get_distinct_categories()
        .await
        .map_err(|e| e.to_string())?;

    Ok(categories)
}

// Command to fetch distinct instances
#[command]
async fn get_distinct_instances() -> Result<Vec<String>, String> {
    let db = DATABASE.get().expect("Database should be initialized");

    let instances = db
        .get_distinct_instances()
        .await
        .map_err(|e| e.to_string())?;

    Ok(instances)
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let db = Database::new().await.expect("Failed to initialize the database");

    DATABASE.set(db).unwrap();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_game, 
            get_game_instances, 
            delete_game, 
            fetch_daily_data, 
            fetch_weekly_data, 
            fetch_monthly_data, 
            fetch_custom_data,
            get_distinct_categories, 
            get_distinct_instances,
            delete_game_by_id,
            get_category_instance_combinations, 
            fetch_yearly_data,
            fetch_yearly_average,
            fetch_monthly_average,
            
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
