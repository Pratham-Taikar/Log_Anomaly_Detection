# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Machine‑Learning Backend (ML)

The server includes an unsupervised Isolation Forest model that flags anomalous log messages. A few notes:

1. **Training** – before starting the API (`uvicorn backend.api.server:app`), run the training script:

   ```sh
   cd backend
   python train.py
   ```

   This reads the datasets in `backend/datasets/` and saves `anomaly_model.pkl` and `tfidf_vectorizer.pkl` to `backend/models`.
   A startup hook in `server.py` will attempt to train automatically if those files are missing, but you should re‑run training any time you add new data.

2. **Limitations** – the model is *unsupervised* and works on TF‑IDF vectors of the message text. It learns "normal" vocabulary from the training set, so
   - messages containing only unknown words map to an empty feature vector and are treated as anomalies (a heuristic added recently);
   - generic errors or warnings that appear in the training data will often still be classified as <code>Normal</code>. Rule‑based detection in
     `backend/rules/rule_engine.py` is used to capture those cases.
   - the confinement has been tuned with a sigmoid scaling factor and a small confidence threshold; you can adjust
     <code>scale</code> or <code>contamination</code> in <code>backend/ml/anomaly_model.py</code> if you need more/less sensitivity.

3. **Re‑training** – to improve results, gather representative normal logs and, if possible, rarer anomalous samples. Re‑run <code>python backend/train.py</code>
   or restart the server (it will retrain automatically when it notices missing model files).

4. **Testing** – a helper script <code>generate_test_logs.py</code> generates 1500 lines of synthetic unstructured logs for use in the upload UI. Feel free to
   modify it to produce more anomalies.

The rest of the README remains unchanged.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
