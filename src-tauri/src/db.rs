use sqlx::{Pool, Sqlite, SqlitePool, sqlite::SqlitePoolOptions};
use serde::Serialize;
use dotenvy::dotenv;
use std::env;

#[derive(Debug)]
pub struct Database {
    pub pool: Pool<Sqlite>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct GameInstance {
    pub id: i16,
    pub category_name: String,
    pub instance_name: String,
    pub price_per_hour: f64,
    pub elapsed_time: Option<i64>, // Nullable
    pub total_cost: f64,
    pub start_time: String,
    pub end_time: Option<String>,  // Nullable
}

impl Database {
    // Update new() to return Result<Self, sqlx::Error>
    pub async fn new() -> Result<Self, sqlx::Error> {
        dotenv().ok();
        let database_url = String::from("sqlite:C:/Users/thkos/AppData/Roaming/TMS/games.db"); // it will create a file in the root of our folder, my database is names 'sqlite.db'
        // let database_url = String::from("./games.db"); // Path to your database file

        // let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");

        let pool = SqlitePool::connect(&database_url).await?;
        Ok(Self { pool })
    }

    pub async fn insert_game(
        &self,
        category_name: &str,
        instance_name: &str,
        price_per_hour: f64,
        elapsed_time: Option<i64>, // Nullable
        total_cost: f64,
        start_time: &str,
        end_time: Option<&str>, // Nullable
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO games (category_name, instance_name, price_per_hour, elapsed_time, total_cost, start_time, end_time)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(category_name)
        .bind(instance_name)
        .bind(price_per_hour)
        .bind(elapsed_time) // Passes the Option<i64> as it is
        .bind(total_cost)
        .bind(start_time)
        .bind(end_time) // Passes the Option<&str> as it is
        .execute(&self.pool)
        .await?;
        Ok(())
    }

     // Function to delete games by category_name and instance_name
     pub async fn delete_game_by_category_and_instance(
        &self,
        category_name: &str,
        instance_name: &str,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            DELETE FROM games WHERE category_name = ? AND instance_name = ?
            "#,
        )
        .bind(category_name)
        .bind(instance_name)
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }

    pub async fn get_game_instances(&self) -> Result<Vec<GameInstance>, sqlx::Error> {
        let rows = sqlx::query_as::<_, GameInstance>(
            r#"
            SELECT *
            FROM games g1
            WHERE g1.start_time = (
                SELECT MAX(g2.start_time)
                FROM games g2
                WHERE g1.instance_name = g2.instance_name and total_cost = 0
            )
            ORDER BY g1.category_name, g1.instance_name
            "#,
        )
        .fetch_all(&self.pool)
        .await?;
        
        Ok(rows)
    }

    pub async fn fetch_daily_data(
        &self,
        category_name: Option<&str>,
        instance_name: Option<&str>,
    ) -> Result<Vec<GameInstance>, sqlx::Error> {
        let query = r#"
            SELECT *
            FROM games g1
            WHERE total_cost > 0
            AND date(start_time) = date('now')
            AND (?1 IS NULL OR category_name = ?1)
            AND (?2 IS NULL OR instance_name = ?2)
            ORDER BY g1.category_name, g1.instance_name

        "#;
        let rows = sqlx::query_as::<_, GameInstance>(query)
            .bind(category_name)
            .bind(instance_name)
            .fetch_all(&self.pool)
            .await?;
        Ok(rows)
    }

    // Fetch data for this week (weekly)
    pub async fn fetch_weekly_data(
        &self,
        category_name: Option<&str>,
        instance_name: Option<&str>,
    ) -> Result<Vec<GameInstance>, sqlx::Error> {
        let query = r#"
            SELECT *
            FROM games g1
            WHERE total_cost > 0
            AND date(start_time) >= date('now', 'weekday 0', '-7 days')
            AND date(start_time) <= date('now', 'weekday 0')
            AND (?1 IS NULL OR category_name = ?1)
            AND (?2 IS NULL OR instance_name = ?2)
            ORDER BY g1.category_name, g1.instance_name
        "#;
        let rows = sqlx::query_as::<_, GameInstance>(query)
            .bind(category_name)
            .bind(instance_name)
            .fetch_all(&self.pool)
            .await?;
        Ok(rows)
    }

    pub async fn get_distinct_categories(&self) -> Result<Vec<String>, sqlx::Error> {
        let rows = sqlx::query_scalar::<_, String>(
            r#"
            SELECT DISTINCT category_name
            FROM games
            "#,
        )
        .fetch_all(&self.pool)
        .await?;
        
        Ok(rows)
    }

    pub async fn get_distinct_instances(&self) -> Result<Vec<String>, sqlx::Error> {
        let rows = sqlx::query_scalar::<_, String>(
            r#"
            SELECT DISTINCT instance_name
            FROM games
            "#,
        )
        .fetch_all(&self.pool)
        .await?;
        
        Ok(rows)
    }

    // Fetch data for this month (monthly)
    pub async fn fetch_monthly_data(
        &self,
        category_name: Option<&str>,
        instance_name: Option<&str>,
    ) -> Result<Vec<GameInstance>, sqlx::Error> {
        let query = r#"
            SELECT *
            FROM games g1
            WHERE total_cost > 0
            AND strftime('%Y-%m', start_time) = strftime('%Y-%m', 'now')
            AND (?1 IS NULL OR category_name = ?1)
            AND (?2 IS NULL OR instance_name = ?2)
            ORDER BY g1.category_name, g1.instance_name
        "#;
        let rows = sqlx::query_as::<_, GameInstance>(query)
            .bind(category_name)
            .bind(instance_name)
            .fetch_all(&self.pool)
            .await?;
        Ok(rows)
    }

    pub async fn delete_game_by_id(&self, id: i16) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            DELETE FROM games WHERE id = ?
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn fetch_custom_data(
        &self,
        category_name: Option<&str>,
        instance_name: Option<&str>,
        start_date: &str,
        end_date: &str,
    ) -> Result<Vec<GameInstance>, sqlx::Error> {
        let query = r#"
            SELECT *
            FROM games g1
            WHERE total_cost > 0
            AND date(start_time) >= ?1
            AND date(start_time) <= ?2
            AND (?3 IS NULL OR category_name = ?3)
            AND (?4 IS NULL OR instance_name = ?4)
            ORDER BY g1.category_name, g1.instance_name
        "#;
        let rows = sqlx::query_as::<_, GameInstance>(query)
            .bind(start_date)
            .bind(end_date)
            .bind(category_name)
            .bind(instance_name)
            .fetch_all(&self.pool)
            .await?;
        Ok(rows)
    }
}
